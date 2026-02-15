/**
 * MyStudio 后端服务
 * Express + LangChain 提供多模型 AI 聊天 API
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import {
  getAllSessions,
  createSession,
  deleteSession,
  getSessionMessages,
  chatStream,
} from './lib/chatManager.js'
import { getAllProviders, getAvailableModels } from './lib/modelRegistry.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// ===== 请求日志中间件 =====
app.use((req, res, next) => {
  const start = Date.now()
  console.log(`[${new Date().toLocaleTimeString()}] --> ${req.method} ${req.url}`)
  res.on('finish', () => {
    console.log(`[${new Date().toLocaleTimeString()}] <-- ${req.method} ${req.url} ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// ===== 模型管理 API =====

/** 获取所有提供商和模型（含可用状态） */
app.get('/api/models', (req, res) => {
  res.json({ success: true, data: getAllProviders() })
})

/** 获取已配置可用的模型列表 */
app.get('/api/models/available', (req, res) => {
  res.json({ success: true, data: getAvailableModels() })
})

// ===== 会话管理 API =====

/** 获取所有会话 */
app.get('/api/sessions', (req, res) => {
  res.json({ success: true, data: getAllSessions() })
})

/** 新建会话 */
app.post('/api/sessions', (req, res) => {
  const { title } = req.body || {}
  const session = createSession(title)
  res.json({ success: true, data: session })
})

/** 删除会话 */
app.delete('/api/sessions/:id', (req, res) => {
  const ok = deleteSession(req.params.id)
  res.json({ success: ok, message: ok ? '已删除' : '会话不存在' })
})

/** 获取会话历史消息 */
app.get('/api/sessions/:id/messages', (req, res) => {
  const messages = getSessionMessages(req.params.id)
  if (messages === null) {
    return res.status(404).json({ success: false, message: '会话不存在' })
  }
  res.json({ success: true, data: messages })
})

// ===== 流式聊天 API =====

/** POST /api/chat - SSE 流式聊天 */
app.post('/api/chat', async (req, res) => {
  const { sessionId, message, providerId, modelName } = req.body
  console.log(`[Chat] 收到请求 provider=${providerId}, model=${modelName}, session=${sessionId}, msg="${message}"`)

  if (!message || !sessionId) {
    return res.status(400).json({ success: false, message: '缺少 sessionId 或 message' })
  }

  if (!providerId) {
    return res.status(400).json({ success: false, message: '缺少 providerId' })
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  let tokenCount = 0
  try {
    console.log('[Chat] 开始调用 LLM...')
    await chatStream(sessionId, message, providerId, modelName, (token) => {
      tokenCount++
      if (tokenCount <= 3) console.log(`[Chat] token #${tokenCount}: "${token}"`)
      res.write(`data: ${JSON.stringify({ token })}\n\n`)
    })

    console.log(`[Chat] 完成，共 ${tokenCount} 个 token`)
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (error) {
    console.error('[Chat] 错误:', error.message)
    res.write(`data: ${JSON.stringify({ error: error.message || '模型调用失败' })}\n\n`)
    res.end()
  }
})

// ===== 健康检查 =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.listen(PORT, () => {
  console.log(`[MyStudio Server] 运行在 http://localhost:${PORT}`)
  const available = getAvailableModels()
  console.log(`[MyStudio Server] 已配置的提供商: ${available.map((p) => p.name).join(', ') || '无'}`)
  if (process.env.HTTPS_PROXY) {
    console.log(`[MyStudio Server] 代理: ${process.env.HTTPS_PROXY}`)
  }
})
