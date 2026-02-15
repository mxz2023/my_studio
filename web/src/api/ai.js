/**
 * AI 助手 API 调用封装
 * 处理与后端的 HTTP / SSE 通信
 */

const BASE = '/api'

/**
 * 获取所有提供商和模型（含可用状态）
 * @returns {Promise<Array>}
 */
export async function getAllModels() {
  const res = await fetch(`${BASE}/models`)
  const json = await res.json()
  return json.data || []
}

/**
 * 获取已配置可用的提供商和模型
 * @returns {Promise<Array>}
 */
export async function getAvailableModels() {
  const res = await fetch(`${BASE}/models/available`)
  const json = await res.json()
  return json.data || []
}

/**
 * 获取所有会话
 * @returns {Promise<Array>}
 */
export async function getSessions() {
  const res = await fetch(`${BASE}/sessions`)
  const json = await res.json()
  return json.data || []
}

/**
 * 创建新会话
 * @param {string} [title]
 * @returns {Promise<Object>}
 */
export async function createSession(title) {
  const res = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  const json = await res.json()
  return json.data
}

/**
 * 删除会话
 * @param {string} id
 */
export async function deleteSession(id) {
  await fetch(`${BASE}/sessions/${id}`, { method: 'DELETE' })
}

/**
 * 获取会话历史消息
 * @param {string} id
 * @returns {Promise<Array>}
 */
export async function getSessionMessages(id) {
  const res = await fetch(`${BASE}/sessions/${id}/messages`)
  const json = await res.json()
  return json.data || []
}

/**
 * 流式聊天
 * @param {string} sessionId
 * @param {string} message
 * @param {string} providerId - 提供商 ID
 * @param {string} modelName - 模型名称
 * @param {function} onToken - 逐 token 回调
 * @param {AbortSignal} [signal] - 用于中断请求
 * @returns {Promise<string>} 完整回复
 */
export async function fetchChatStream(sessionId, message, providerId, modelName, onToken, signal) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message, providerId, modelName }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const dataStr = line.slice(6).trim()
      if (!dataStr) continue

      try {
        const data = JSON.parse(dataStr)
        if (data.error) {
          throw new Error(data.error)
        }
        if (data.done) {
          return fullText
        }
        if (data.token) {
          fullText += data.token
          onToken(data.token)
        }
      } catch (e) {
        if (e.message && !e.message.includes('JSON')) {
          throw e
        }
      }
    }
  }

  return fullText
}
