/**
 * useTheme - 全局主题管理 composable
 *
 * 功能：
 *   - 支持 light / dark / auto 三种模式
 *   - auto 模式跟随系统偏好并实时监听变化
 *   - 主题选择持久化到 localStorage
 *   - 通过 html.dark 类名切换 Element Plus 暗色模式
 *   - 通过 CSS 变量控制自定义组件颜色
 *
 * 使用单例模式：所有组件共享同一份状态
 */
import { ref, watch } from 'vue'

const STORAGE_KEY = 'mystudio-theme'

// 单例状态（模块级别，所有 useTheme() 调用共享）
const themeMode = ref(localStorage.getItem(STORAGE_KEY) || 'light')

let mediaQuery = null
let mediaHandler = null

/**
 * 根据当前 themeMode 计算实际应用的主题（light 或 dark）
 */
function getEffectiveTheme(mode) {
  if (mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

/**
 * 将主题应用到 DOM
 */
function applyTheme(mode) {
  const effective = getEffectiveTheme(mode)
  const html = document.documentElement

  if (effective === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

/**
 * 设置系统主题变化监听（auto 模式下使用）
 */
function setupAutoListener() {
  cleanupAutoListener()
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaHandler = () => applyTheme('auto')
  mediaQuery.addEventListener('change', mediaHandler)
}

function cleanupAutoListener() {
  if (mediaQuery && mediaHandler) {
    mediaQuery.removeEventListener('change', mediaHandler)
    mediaQuery = null
    mediaHandler = null
  }
}

export function useTheme() {
  /**
   * 切换主题模式
   */
  function setTheme(mode) {
    themeMode.value = mode
    localStorage.setItem(STORAGE_KEY, mode)
    applyTheme(mode)

    if (mode === 'auto') {
      setupAutoListener()
    } else {
      cleanupAutoListener()
    }
  }

  // 监听 themeMode 变化（处理从外部直接修改 ref 的情况）
  watch(themeMode, (newMode) => {
    localStorage.setItem(STORAGE_KEY, newMode)
    applyTheme(newMode)
    if (newMode === 'auto') {
      setupAutoListener()
    } else {
      cleanupAutoListener()
    }
  })

  // 初始化：首次调用时应用主题
  applyTheme(themeMode.value)
  if (themeMode.value === 'auto') {
    setupAutoListener()
  }

  return {
    themeMode,
    setTheme,
  }
}
