<script setup>
/**
 * SettingView - 系统设置页面
 * 主题设置 + 模型管理展示
 */
import { ref, watch, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme.js'
import { getAllModels } from '@/api/ai.js'

const { themeMode, setTheme } = useTheme()

watch(themeMode, (newTheme) => {
  setTheme(newTheme)
})

// ===== 模型管理 =====
const providers = ref([])
const loadingModels = ref(false)

async function loadProviders() {
  loadingModels.value = true
  try {
    providers.value = await getAllModels()
  } catch {
    providers.value = []
  } finally {
    loadingModels.value = false
  }
}

onMounted(loadProviders)
</script>

<template>
  <div class="setting-view">
    <!-- 主题设置 -->
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

    <!-- 模型管理 -->
    <el-card shadow="never" class="section-card model-card">
      <template #header>
        <div class="card-header">
          <span class="page-title"><el-icon :size="20"><Cpu /></el-icon> 模型管理</span>
          <el-button size="small" @click="loadProviders" :loading="loadingModels">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </template>

      <div class="model-hint">
        <el-icon><InfoFilled /></el-icon>
        在 <code>server/.env</code> 文件中配置各提供商的 API Key 即可启用对应模型，修改后需重启后端服务。
      </div>

      <div v-loading="loadingModels" class="provider-grid">
        <div
          v-for="p in providers"
          :key="p.id"
          class="provider-card"
          :class="{ available: p.available, unavailable: !p.available }"
        >
          <div class="provider-header">
            <span class="provider-name">{{ p.name }}</span>
            <el-tag :type="p.available ? 'success' : 'info'" size="small" round>
              {{ p.available ? '已配置' : '未配置' }}
            </el-tag>
          </div>
          <div class="provider-models">
            <el-tag
              v-for="m in p.models"
              :key="m.id"
              size="small"
              :type="p.available ? '' : 'info'"
              :effect="p.available ? 'light' : 'plain'"
              class="model-tag"
            >
              {{ m.name }}
            </el-tag>
          </div>
          <div v-if="p.needsProxy" class="provider-note">
            <el-icon :size="12"><Warning /></el-icon> 需要代理访问
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.setting-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-card { border-radius: 10px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 16px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; transition: color 0.3s; }

/* 模型管理 */
.model-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: rgba(64, 158, 255, 0.06);
  color: var(--text-secondary);
  font-size: 13px;
  transition: background 0.3s, color 0.3s;
}

.model-hint code {
  background: rgba(64, 158, 255, 0.12);
  color: #409EFF;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Menlo', 'Monaco', monospace;
  font-size: 12px;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.provider-card {
  border-radius: 10px;
  padding: 16px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
  background: var(--bg-container);
}

.provider-card.available {
  border-color: rgba(103, 194, 58, 0.3);
}

.provider-card.unavailable {
  opacity: 0.6;
}

.provider-card:hover {
  border-color: #409EFF;
}

.provider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.provider-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s;
}

.provider-models {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.model-tag {
  font-size: 12px;
}

.provider-note {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-placeholder);
  margin-top: 4px;
}
</style>
