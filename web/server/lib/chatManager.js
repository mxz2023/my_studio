/**
 * ChatManager - 会话管理器
 * 管理多会话的对话记忆，调用 ModelRegistry 创建模型实例
 */
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { v4 as uuidv4 } from 'uuid'
import { createModel } from './modelRegistry.js'

/** 会话存储（内存，重启清空） */
const sessions = new Map()

const SYSTEM_PROMPT = '你是一个智能助手，请用中文回答用户的问题。回答要简洁、专业、有帮助。'

/**
 * 获取所有会话列表
 */
export function getAllSessions() {
  const list = []
  for (const [id, session] of sessions) {
    list.push({
      id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
    })
  }
  list.sort((a, b) => b.updatedAt - a.updatedAt)
  return list
}

/**
 * 创建新会话
 */
export function createSession(title) {
  const id = uuidv4()
  const now = Date.now()
  sessions.set(id, {
    title: title || '新对话',
    createdAt: now,
    updatedAt: now,
    messages: [],
  })
  return { id, title: title || '新对话', createdAt: now, updatedAt: now, messageCount: 0 }
}

/**
 * 删除会话
 */
export function deleteSession(id) {
  return sessions.delete(id)
}

/**
 * 获取会话历史消息
 */
export function getSessionMessages(id) {
  const session = sessions.get(id)
  if (!session) return null
  return session.messages
}

/**
 * 构建 LangChain 消息数组（含历史上下文）
 * 保留最近 20 轮对话作为上下文窗口
 */
function buildMessages(session, userMessage) {
  const msgs = [new SystemMessage(SYSTEM_PROMPT)]

  const recentMessages = session.messages.slice(-40)
  for (const msg of recentMessages) {
    if (msg.role === 'user') {
      msgs.push(new HumanMessage(msg.content))
    } else if (msg.role === 'assistant') {
      msgs.push(new AIMessage(msg.content))
    }
  }

  msgs.push(new HumanMessage(userMessage))
  return msgs
}

/**
 * 流式聊天
 * @param {string} sessionId - 会话 ID
 * @param {string} userMessage - 用户消息
 * @param {string} providerId - 提供商 ID (openai/deepseek/gemini/claude/qwen)
 * @param {string} modelName - 模型名称
 * @param {function} onToken - 逐 token 回调
 * @returns {Promise<string>} 完整的 AI 回复
 */
export async function chatStream(sessionId, userMessage, providerId, modelName, onToken) {
  let session = sessions.get(sessionId)
  if (!session) {
    const now = Date.now()
    sessions.set(sessionId, {
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      messages: [],
    })
    session = sessions.get(sessionId)
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  // 保存用户消息
  session.messages.push({ role: 'user', content: userMessage, time: timeStr })

  // 自动用第一条消息作为标题
  if (session.messages.length === 1) {
    session.title = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '')
  }

  // 通过 ModelRegistry 创建模型
  const model = createModel(providerId, modelName)
  const messages = buildMessages(session, userMessage)
  console.log(`[ChatManager] 提供商: ${providerId}, 模型: ${modelName}, 消息数: ${messages.length}`)

  let fullResponse = ''
  try {
    console.log('[ChatManager] 开始 stream 调用...')
    const stream = await model.stream(messages)
    console.log('[ChatManager] stream 已创建，读取 token...')

    for await (const chunk of stream) {
      const token = chunk.content
      if (token) {
        fullResponse += token
        onToken(token)
      }
    }
    console.log(`[ChatManager] 完成，回复长度: ${fullResponse.length}`)
  } catch (err) {
    console.error('[ChatManager] LLM 调用失败:', err.message)
    throw err
  }

  // 保存 AI 回复
  const aiTimeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  session.messages.push({ role: 'assistant', content: fullResponse, time: aiTimeStr })
  session.updatedAt = Date.now()

  return fullResponse
}
