/**
 * AI 助手模块静态配置
 * 模型列表从后端动态获取，此处只保留不依赖后端的静态配置
 */

/** 欢迎消息 */
export const welcomeMessage = {
  role: 'assistant',
  content: '你好！我是 AI 助手，有什么可以帮你的？\n\n我可以帮助你：\n- 回答问题和解释概念\n- 编写和审查代码\n- 分析数据和总结文档\n- 头脑风暴和创意写作',
  time: '',
}

/** 创建带时间戳的欢迎消息 */
export function createWelcomeMessage() {
  return {
    ...welcomeMessage,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }
}

/** 提供商图标映射 */
export const providerIcons = {
  openai: 'ChatLineSquare',
  deepseek: 'Cpu',
  gemini: 'MagicStick',
  claude: 'ChatDotSquare',
  qwen: 'Cloudy',
}
