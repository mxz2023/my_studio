<script setup>
/**
 * RecentProjects - 最近项目列表组件
 *
 * Props:
 *   projects - 项目数据数组 [{ name, status, progress, team, date }]
 *
 * Events:
 *   @view-all - 点击「查看全部」时触发
 */
defineProps({
  projects: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['view-all'])

const statusType = (status) => {
  const map = { '进行中': 'warning', '已完成': 'success', '待启动': 'info' }
  return map[status] || 'info'
}
</script>

<template>
  <el-card shadow="never" class="recent-projects">
    <template #header>
      <div class="card-header">
        <span class="card-title">最近项目</span>
        <el-button type="primary" link @click="emit('view-all')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>
    <el-table :data="projects" stripe style="width: 100%">
      <el-table-column prop="name" label="项目名称" min-width="160" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="进度" width="160">
        <template #default="{ row }">
          <el-progress
            :percentage="row.progress"
            :status="row.progress === 100 ? 'success' : ''"
            :stroke-width="8"
          />
        </template>
      </el-table-column>
      <el-table-column prop="team" label="成员" width="80" align="center">
        <template #default="{ row }">
          <el-badge :value="row.team" type="primary" />
        </template>
      </el-table-column>
      <el-table-column prop="date" label="更新时间" width="120" />
    </el-table>
  </el-card>
</template>

<style scoped>
.recent-projects {
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
</style>
