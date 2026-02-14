<script setup>
/**
 * AiAssistantView - 大模型助手页面
 */
import { ref } from 'vue'

const inputText = ref('')
const chatHistory = ref([
  { role: 'assistant', content: '你好！我是 AI 助手，有什么可以帮你的？', time: '15:30' },
])

const modelOptions = [
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'Claude 3.5', value: 'claude-3.5' },
  { label: 'Gemini Pro', value: 'gemini-pro' },
  { label: 'DeepSeek V3', value: 'deepseek-v3' },
]
const selectedModel = ref('gpt-4o')

const sendMessage = () => {
  if (!inputText.value.trim()) return
  chatHistory.value.push({
    role: 'user',
    content: inputText.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  })
  const userMsg = inputText.value
  inputText.value = ''
  // 模拟 AI 回复
  setTimeout(() => {
    chatHistory.value.push({
      role: 'assistant',
      content: `收到你的消息：「${userMsg}」。这是模拟回复，后续会接入真实大模型 API。`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })
  }, 800)
}
</script>

<template>
  <div class="ai-view">
    <el-card shadow="never" class="chat-card">
      <template #header>
        <div class="chat-header">
          <span class="page-title">
            <el-icon :size="20"><ChatLineSquare /></el-icon> 大模型助手
          </span>
          <el-select v-model="selectedModel" size="default" style="width: 160px">
            <el-option v-for="m in modelOptions" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
        </div>
      </template>

      <div class="chat-body">
        <div v-for="(msg, idx) in chatHistory" :key="idx" class="chat-msg" :class="msg.role">
          <el-avatar :size="32" :style="{ backgroundColor: msg.role === 'user' ? '#409EFF' : '#67C23A' }">
            {{ msg.role === 'user' ? 'U' : 'AI' }}
          </el-avatar>
          <div class="msg-bubble">
            <div class="msg-content">{{ msg.content }}</div>
            <div class="msg-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="inputText"
          placeholder="输入你的问题..."
          size="large"
          @keyup.enter="sendMessage"
        >
          <template #append>
            <el-button type="primary" @click="sendMessage" :icon="'Promotion'">发送</el-button>
          </template>
        </el-input>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.ai-view { height: 100%; display: flex; flex-direction: column; }
.chat-card { border-radius: 10px; flex: 1; display: flex; flex-direction: column; }
.chat-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 0; }
.chat-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 16px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; transition: color 0.3s; }
.chat-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.chat-msg { display: flex; gap: 10px; max-width: 80%; }
.chat-msg.user { align-self: flex-end; flex-direction: row-reverse; }
.msg-bubble { background: var(--bg-hover); border-radius: 10px; padding: 12px 16px; }
.chat-msg.user .msg-bubble { background: #ecf5ff; }
.msg-content { font-size: 14px; color: var(--text-primary); line-height: 1.6; }
.msg-time { font-size: 11px; color: var(--text-secondary); margin-top: 4px; }
.chat-input { padding: 16px 20px; border-top: 1px solid var(--border-color); }
</style>
