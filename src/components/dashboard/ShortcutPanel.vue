<script setup>
/**
 * ShortcutPanel - 快捷操作面板组件
 *
 * Props:
 *   shortcuts - 快捷操作数组 [{ icon, title, color }]
 *
 * Events:
 *   @shortcut-click - 点击快捷操作时触发，参数为该操作项对象
 */
defineProps({
  shortcuts: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['shortcut-click'])
</script>

<template>
  <el-card shadow="never" class="shortcut-panel">
    <template #header>
      <div class="card-header">
        <span class="card-title">快捷操作</span>
      </div>
    </template>
    <div class="shortcuts-grid">
      <div
        v-for="item in shortcuts"
        :key="item.title"
        class="shortcut-item"
        @click="emit('shortcut-click', item)"
      >
        <div class="shortcut-icon" :style="{ backgroundColor: item.color + '15', color: item.color }">
          <el-icon :size="24"><component :is="item.icon" /></el-icon>
        </div>
        <span class="shortcut-text">{{ item.title }}</span>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.shortcut-panel {
  border-radius: 10px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.shortcut-item:hover {
  background: #f5f7fa;
  transform: translateY(-2px);
}

.shortcut-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-text {
  font-size: 13px;
  color: #606266;
}

@media (max-width: 768px) {
  .shortcuts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
