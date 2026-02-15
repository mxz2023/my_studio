/**
 * ModelRegistry - 多模型注册表
 * 统一管理所有 LLM 提供商的初始化和配置
 */
import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi'
import { HttpsProxyAgent } from 'https-proxy-agent'

/**
 * 提供商定义
 * 每个提供商包含：id, name, envKey(判断是否已配置), models(支持的模型列表), create(工厂函数)
 */
const providerDefinitions = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    envKey: 'DEEPSEEK_API_KEY',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner' },
    ],
    defaultModel: 'deepseek-chat',
    needsProxy: false,
    create(modelName) {
      const config = {
        modelName: modelName || process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        streaming: true,
        openAIApiKey: process.env.DEEPSEEK_API_KEY,
        configuration: {
          baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        },
      }
      return new ChatOpenAI(config)
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    defaultModel: 'gpt-4o',
    needsProxy: true,
    create(modelName) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
      const config = {
        modelName: modelName || process.env.OPENAI_MODEL || 'gpt-4o',
        streaming: true,
        openAIApiKey: process.env.OPENAI_API_KEY,
        configuration: {},
      }
      if (process.env.OPENAI_BASE_URL) {
        config.configuration.baseURL = process.env.OPENAI_BASE_URL
      }
      if (proxyUrl) {
        config.configuration.httpAgent = new HttpsProxyAgent(proxyUrl)
      }
      return new ChatOpenAI(config)
    },
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    envKey: 'GOOGLE_API_KEY',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    ],
    defaultModel: 'gemini-2.5-flash',
    needsProxy: true,
    create(modelName) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
      const config = {
        model: modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        streaming: true,
      }
      // Google SDK 通过自定义 fetch 配置代理
      if (proxyUrl) {
        const agent = new HttpsProxyAgent(proxyUrl)
        config.baseUrl = `https://generativelanguage.googleapis.com`
        // 注入代理到底层 HTTP 请求
        const originalFetch = globalThis.fetch
        config.customHeaders = {}
      }
      return new ChatGoogleGenerativeAI(config)
    },
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    envKey: 'ANTHROPIC_API_KEY',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    ],
    defaultModel: 'claude-sonnet-4-20250514',
    needsProxy: true,
    create(modelName) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
      const config = {
        model: modelName || process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        streaming: true,
      }
      if (proxyUrl) {
        config.clientOptions = {
          httpAgent: new HttpsProxyAgent(proxyUrl),
        }
      }
      return new ChatAnthropic(config)
    },
  },
  {
    id: 'qwen',
    name: '通义千问',
    envKey: 'ALIBABA_API_KEY',
    models: [
      { id: 'qwen-plus', name: 'Qwen Plus' },
      { id: 'qwen-turbo', name: 'Qwen Turbo' },
      { id: 'qwen-max', name: 'Qwen Max' },
    ],
    defaultModel: 'qwen-plus',
    needsProxy: false,
    create(modelName) {
      return new ChatAlibabaTongyi({
        model: modelName || process.env.QWEN_MODEL || 'qwen-plus',
        alibabaApiKey: process.env.ALIBABA_API_KEY,
        streaming: true,
      })
    },
  },
]

/**
 * 获取所有提供商信息（含可用状态）
 * @returns {Array} 提供商列表
 */
export function getAllProviders() {
  return providerDefinitions.map((p) => ({
    id: p.id,
    name: p.name,
    available: !!process.env[p.envKey],
    needsProxy: p.needsProxy,
    models: p.models,
    defaultModel: p.defaultModel,
  }))
}

/**
 * 获取已配置（可用）的提供商和模型列表
 * @returns {Array} 可用的提供商列表
 */
export function getAvailableModels() {
  return getAllProviders().filter((p) => p.available)
}

/**
 * 创建指定提供商的模型实例
 * @param {string} providerId - 提供商 ID
 * @param {string} [modelName] - 模型名称（可选，不传则用默认）
 * @returns {Object} LangChain Chat Model 实例
 */
export function createModel(providerId, modelName) {
  const provider = providerDefinitions.find((p) => p.id === providerId)
  if (!provider) {
    throw new Error(`未知的提供商: ${providerId}`)
  }
  if (!process.env[provider.envKey]) {
    throw new Error(`提供商 ${provider.name} 未配置 API Key（${provider.envKey}）`)
  }
  console.log(`[ModelRegistry] 创建模型: ${provider.name} / ${modelName || provider.defaultModel}`)
  return provider.create(modelName)
}
