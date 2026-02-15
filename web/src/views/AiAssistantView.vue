<script setup>
/**
 * AiAssistantView - 大模型助手页面
 * 支持多会话管理、多模型切换、流式输出、多轮对话记忆
 */
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createWelcomeMessage } from '@/data/ai.js'
import {
  getSessions,
  getAvailableModels,
  createSession as apiCreateSession,
  deleteSession as apiDeleteSession,
  getSessionMessages,
  fetchChatStream,
} from '@/api/ai.js'

// ===== 模型管理 =====
const availableProviders = ref([])
const selectedProviderId = ref('')
const selectedModelName = ref('')

// 当前提供商下的模型列表
const currentModels = computed(() => {
  const p = availableProviders.value.find((p) => p.id === selectedProviderId.value)
  return p ? p.models : []
})

// 模型选择的展示文字
const modelDisplayLabel = computed(() => {
  const p = availableProviders.value.find((p) => p.id === selectedProviderId.value)
  const m = currentModels.value.find((m) => m.id === selectedModelName.value)
  if (p && m) return `${p.name} / ${m.name}`
  return '选择模型'
})

function onProviderChange(pid) {
  selectedProviderId.value = pid
  const p = availableProviders.value.find((p) => p.id === pid)
  if (p) {
    selectedModelName.value = p.defaultModel || p.models[0]?.id || ''
  }
}

async function loadModels() {
  try {
    availableProviders.value = await getAvailableModels()
    // 默认选第一个可用提供商
    if (availableProviders.value.length > 0 && !selectedProviderId.value) {
      onProviderChange(availableProviders.value[0].id)
    }
  } catch {
    availableProviders.value = []
  }
}

// ===== 会话管理 =====
const sessions = ref([])
const activeSessionId = ref('')
const chatMessages = ref([])

// ===== 输入与状态 =====
const inputText = ref('')
const isLoading = ref(false)
const chatBodyRef = ref(null)
let abortController = null

async function loadSessions() {
  try {
    sessions.value = await getSessions()
  } catch {
    sessions.value = []
  }
}

async function handleCreateSession() {
  try {
    const session = await apiCreateSession()
    sessions.value.unshift(session)
    await switchSession(session.id)
  } catch {
    ElMessage.error('创建会话失败')
  }
}

async function switchSession(id) {
  if (id === activeSessionId.value) return
  activeSessionId.value = id
  try {
    const msgs = await getSessionMessages(id)
    if (msgs && msgs.length > 0) {
      chatMessages.value = msgs
    } else {
      chatMessages.value = [createWelcomeMessage()]
    }
  } catch {
    chatMessages.value = [createWelcomeMessage()]
  }
  await nextTick()
  scrollToBottom()
}

function handleDeleteSession(id, e) {
  e.stopPropagation()
  const session = sessions.value.find((s) => s.id === id)
  ElMessageBox.confirm(
    `确定删除会话「${session?.title || '未命名'}」吗？`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      await apiDeleteSession(id)
      sessions.value = sessions.value.filter((s) => s.id !== id)
      if (activeSessionId.value === id) {
        if (sessions.value.length > 0) {
          await switchSession(sessions.value[0].id)
        } else {
          activeSessionId.value = ''
          chatMessages.value = [createWelcomeMessage()]
        }
      }
      ElMessage.success('已删除')
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// ===== 发送消息 =====
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  if (!selectedProviderId.value || !selectedModelName.value) {
    ElMessage.warning('请先选择一个模型')
    return
  }

  if (!activeSessionId.value) {
    await handleCreateSession()
  }

  const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  chatMessages.value.push({ role: 'user', content: text, time: timeStr })
  inputText.value = ''
  await nextTick()
  scrollToBottom()

  const aiMsg = { role: 'assistant', content: '', time: '', loading: true }
  chatMessages.value.push(aiMsg)
  isLoading.value = true
  abortController = new AbortController()

  try {
    console.log(`[AI Chat] provider=${selectedProviderId.value}, model=${selectedModelName.value}`)
    await fetchChatStream(
      activeSessionId.value,
      text,
      selectedProviderId.value,
      selectedModelName.value,
      (token) => {
        aiMsg.content += token
        aiMsg.loading = false
        scrollToBottom()
      },
      abortController.signal
    )
    aiMsg.time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    aiMsg.loading = false
    await loadSessions()
  } catch (err) {
    console.error('[AI Chat] 错误:', err)
    if (err.name === 'AbortError') {
      aiMsg.content += '\n\n[已停止生成]'
    } else {
      aiMsg.content = `抱歉，出现了错误：${err.message}`
    }
    aiMsg.loading = false
    aiMsg.time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } finally {
    isLoading.value = false
    abortController = null
  }
}

function stopGeneration() {
  if (abortController) abortController.abort()
}

// ===== 工具函数 =====
function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

function formatContent(content) {
  let html = escapeHtml(content)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="msg-code-block"><code>$2</code></pre>')
  html = html.replace(/`([^`]+)`/g, '<code class="msg-inline-code">$1</code>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/^- (.+)$/gm, '<div class="msg-list-item">• $1</div>')
  html = html.replace(/\n/g, '<br>')
  return html
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const activeSession = computed(() => sessions.value.find((s) => s.id === activeSessionId.value))

// ===== 初始化 =====
onMounted(async () => {
  await Promise.all([loadModels(), loadSessions()])
  if (sessions.value.length > 0) {
    await switchSession(sessions.value[0].id)
  } else {
    chatMessages.value = [createWelcomeMessage()]
  }
})
</script>

<template>
  <div class="ai-view">
    <!-- 左侧会话列表 -->
    <div class="session-panel">
      <div class="session-header">
        <span class="session-title">对话列表</span>
        <el-button type="primary" size="small" @click="handleCreateSession" :icon="'Plus'" circle />
      </div>
      <div class="session-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="session-item"
          :class="{ active: s.id === activeSessionId }"
          @click="switchSession(s.id)"
        >
          <el-icon class="session-icon"><ChatLineSquare /></el-icon>
          <div class="session-info">
            <div class="session-name">{{ s.title }}</div>
            <div class="session-meta">{{ s.messageCount || 0 }} 条消息</div>
          </div>
          <el-button
            class="session-delete"
            type="danger"
            link
            size="small"
            @click="handleDeleteSession(s.id, $event)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <div v-if="sessions.length === 0" class="session-empty">
          <el-icon :size="32"><ChatLineSquare /></el-icon>
          <span>暂无对话</span>
          <span class="session-empty-hint">点击 + 开始新对话</span>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-panel">
      <!-- 顶部栏 -->
      <div class="chat-top-bar">
        <span class="chat-top-title">{{ activeSession?.title || '大模型助手' }}</span>
        <div class="model-selector">
          <!-- 提供商选择 -->
          <el-select
            v-model="selectedProviderId"
            size="default"
            placeholder="提供商"
            style="width: 140px"
            @change="onProviderChange"
          >
            <el-option
              v-for="p in availableProviders"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
          <!-- 模型选择 -->
          <el-select
            v-model="selectedModelName"
            size="default"
            placeholder="模型"
            style="width: 180px"
          >
            <el-option
              v-for="m in currentModels"
              :key="m.id"
              :label="m.name"
              :value="m.id"
            />
          </el-select>
        </div>
      </div>

      <!-- 无可用模型提示 -->
      <div v-if="availableProviders.length === 0" class="no-model-hint">
        <el-icon :size="40"><Warning /></el-icon>
        <div class="no-model-text">暂无可用模型</div>
        <div class="no-model-sub">请在 <code>server/.env</code> 中配置至少一个提供商的 API Key，然后重启后端服务</div>
      </div>

      <!-- 消息列表 -->
      <div v-else ref="chatBodyRef" class="chat-body">
        <div v-for="(msg, idx) in chatMessages" :key="idx" class="chat-msg" :class="msg.role">
          <div class="msg-avatar">
            <el-avatar :size="34" :style="{ backgroundColor: msg.role === 'user' ? '#409EFF' : '#67C23A' }">
              {{ msg.role === 'user' ? 'U' : 'AI' }}
            </el-avatar>
          </div>
          <div class="msg-bubble">
            <div v-if="msg.loading && !msg.content" class="msg-loading">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </div>
            <div v-else class="msg-content" v-html="formatContent(msg.content)"></div>
            <div v-if="msg.time" class="msg-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <div class="chat-input-wrapper">
          <el-input
            v-model="inputText"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            placeholder="输入你的问题，Enter 发送..."
            resize="none"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="chat-input-actions">
            <el-button
              v-if="isLoading"
              type="danger"
              @click="stopGeneration"
              round
              size="default"
            >
              <el-icon><VideoPause /></el-icon> 停止
            </el-button>
            <el-button
              v-else
              type="primary"
              @click="sendMessage"
              :disabled="!inputText.trim() || !selectedProviderId"
              round
              size="default"
            >
              <el-icon><Promotion /></el-icon> 发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-view {
  height: 100%;
  display: flex;
  gap: 0;
  overflow: hidden;
}

/* ===== 会话列表面板 ===== */
.session-panel {
  width: 260px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  background: var(--bg-container);
  border-right: 1px solid var(--border-color);
  border-radius: 10px 0 0 10px;
  transition: background 0.3s, border-color 0.3s;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s;
}

.session-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.session-item:hover { background: var(--bg-hover); }
.session-item.active { background: rgba(64, 158, 255, 0.1); }

.session-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
  font-size: 16px;
  transition: color 0.3s;
}

.session-item.active .session-icon { color: #409EFF; }

.session-info { flex: 1; min-width: 0; }

.session-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.session-item.active .session-name { color: #409EFF; }

.session-meta {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
  transition: color 0.3s;
}

.session-delete {
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.session-item:hover .session-delete { opacity: 1; }

.session-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: var(--text-placeholder);
  font-size: 13px;
}

.session-empty-hint {
  font-size: 12px;
  color: var(--text-placeholder);
}

/* ===== 聊天面板 ===== */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-container);
  border-radius: 0 10px 10px 0;
  overflow: hidden;
  transition: background 0.3s;
}

.chat-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s;
  gap: 12px;
}

.chat-top-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  transition: color 0.3s;
}

.model-selector {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 无可用模型提示 */
.no-model-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-placeholder);
}

.no-model-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.no-model-sub {
  font-size: 13px;
  color: var(--text-placeholder);
  text-align: center;
  line-height: 1.6;
}

.no-model-sub code {
  background: rgba(64, 158, 255, 0.12);
  color: #409EFF;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Menlo', 'Monaco', monospace;
  font-size: 12px;
}

/* ===== 消息列表 ===== */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chat-msg {
  display: flex;
  gap: 12px;
  max-width: 85%;
  animation: msgFadeIn 0.3s ease;
}

@keyframes msgFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-msg.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar { flex-shrink: 0; }

.msg-bubble {
  border-radius: 12px;
  padding: 12px 16px;
  background: var(--bg-hover);
  transition: background 0.3s;
  min-width: 60px;
}

.chat-msg.user .msg-bubble {
  background: rgba(64, 158, 255, 0.12);
}

.msg-content {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  word-break: break-word;
  transition: color 0.3s;
}

.msg-content :deep(.msg-code-block) {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  padding: 10px 14px;
  margin: 8px 0;
  overflow-x: auto;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.msg-content :deep(.msg-inline-code) {
  background: rgba(64, 158, 255, 0.12);
  color: #409EFF;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
}

.msg-content :deep(.msg-list-item) {
  padding: 2px 0;
}

.msg-time {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
  transition: color 0.3s;
}

/* 加载动画 */
.msg-loading {
  display: flex;
  gap: 6px;
  padding: 4px 0;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: dotBounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ===== 输入区域 ===== */
.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  transition: border-color 0.3s;
}

.chat-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.chat-input-wrapper :deep(.el-textarea__inner) {
  padding-right: 12px;
  border-radius: 10px;
}

.chat-input-actions {
  flex-shrink: 0;
}
</style>
