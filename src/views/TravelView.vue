<script setup>
/**
 * TravelView - 旅行管理页面
 */
const trips = [
  { id: 1, destination: '日本东京', startDate: '2026-03-15', endDate: '2026-03-22', status: '计划中', budget: '¥15,000', days: 7 },
  { id: 2, destination: '云南大理', startDate: '2026-01-20', endDate: '2026-01-25', status: '已完成', budget: '¥5,600', days: 5 },
  { id: 3, destination: '泰国清迈', startDate: '2026-05-01', endDate: '2026-05-07', status: '计划中', budget: '¥8,000', days: 6 },
  { id: 4, destination: '北京故宫', startDate: '2025-12-28', endDate: '2025-12-30', status: '已完成', budget: '¥3,200', days: 2 },
]
const statusType = { '计划中': 'warning', '已完成': 'success', '进行中': 'primary' }
</script>

<template>
  <div class="travel-view">
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span class="page-title"><el-icon :size="20"><Location /></el-icon> 旅行</span>
          <el-button type="primary" :icon="'Plus'">新建行程</el-button>
        </div>
      </template>
      <el-table :data="trips" stripe style="width: 100%">
        <el-table-column prop="destination" label="目的地" min-width="160" />
        <el-table-column label="日期" width="220">
          <template #default="{ row }">
            {{ row.startDate }} ~ {{ row.endDate }}
          </template>
        </el-table-column>
        <el-table-column prop="days" label="天数" width="80" align="center">
          <template #default="{ row }">
            {{ row.days }} 天
          </template>
        </el-table-column>
        <el-table-column prop="budget" label="预算" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default>
            <el-button type="primary" link size="small">详情</el-button>
            <el-button type="danger" link size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.section-card { border-radius: 10px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 16px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; transition: color 0.3s; }
</style>
