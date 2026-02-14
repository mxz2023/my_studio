<script setup>
/**
 * SettingView - 系统设置页面
 */
import { watch } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

const { themeMode, setTheme } = useTheme()

// 主题切换即时生效
watch(themeMode, (newTheme) => {
  setTheme(newTheme)
})
</script>

<template>
  <div class="setting-view">
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span class="page-title"><el-icon :size="20"><Setting /></el-icon> 设置</span>
        </div>
      </template>
      <el-form label-width="120px" style="max-width: 560px">
        <el-form-item label="主题模式">
          <el-radio-group v-model="themeMode">
            <el-radio-button value="light">
              <el-icon style="margin-right: 4px"><Sunny /></el-icon>浅色
            </el-radio-button>
            <el-radio-button value="dark">
              <el-icon style="margin-right: 4px"><Moon /></el-icon>深色
            </el-radio-button>
            <el-radio-button value="auto">
              <el-icon style="margin-right: 4px"><Monitor /></el-icon>跟随系统
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.section-card { border-radius: 10px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 16px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; transition: color 0.3s; }
</style>
