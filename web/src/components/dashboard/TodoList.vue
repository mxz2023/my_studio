<script setup>
/**
 * TodoList - 待办事项组件
 *
 * Props:
 *   items - 待办事项数组 [{ id, text, done, priority }]
 *
 * Events:
 *   @toggle - 切换待办完成状态，参数为该项对象
 *   @add - 点击「添加」按钮时触发
 */
defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['toggle', 'add'])

const priorityColor = (priority) => {
  const map = { high: '#F56C6C', medium: '#E6A23C', low: '#909399' }
  return map[priority] || '#909399'
}

const priorityLabel = (priority) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || '低'
}
</script>

<template>
  <el-card shadow="never" class="todo-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">待办事项</span>
        <el-button type="primary" link @click="emit('add')">
          <el-icon><Plus /></el-icon> 添加
        </el-button>
      </div>
    </template>
    <div class="todo-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="todo-item"
        :class="{ 'todo-done': item.done }"
        @click="emit('toggle', item)"
      >
        <el-checkbox :model-value="item.done" @click.stop="emit('toggle', item)" />
        <span class="todo-text">{{ item.text }}</span>
        <span
          class="todo-priority"
          :style="{ backgroundColor: priorityColor(item.priority) + '20', color: priorityColor(item.priority) }"
        >
          {{ priorityLabel(item.priority) }}
        </span>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.todo-card {
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

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #f5f7fa;
}

.todo-done .todo-text {
  text-decoration: line-through;
  color: #c0c4cc;
}

.todo-text {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.todo-priority {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
</style>
