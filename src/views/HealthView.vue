<script setup>
/**
 * HealthView - 健康管理页面
 */
const healthData = [
  { title: '今日步数', value: '8,562', unit: '步', icon: 'Position', color: '#409EFF' },
  { title: '体重', value: '72.5', unit: 'kg', icon: 'Scale', color: '#E6A23C' },
  { title: '睡眠时长', value: '7.5', unit: '小时', icon: 'Moon', color: '#9b59b6' },
  { title: '饮水量', value: '1,800', unit: 'ml', icon: 'Coffee', color: '#67C23A' },
]

const records = [
  { date: '2026-02-14', exercise: '跑步 5km', sleep: '7.5h', weight: '72.5kg', mood: '良好' },
  { date: '2026-02-13', exercise: '游泳 1h', sleep: '8h', weight: '72.8kg', mood: '很好' },
  { date: '2026-02-12', exercise: '无', sleep: '6h', weight: '73.0kg', mood: '一般' },
  { date: '2026-02-11', exercise: '健身 1.5h', sleep: '7h', weight: '72.6kg', mood: '良好' },
  { date: '2026-02-10', exercise: '跑步 3km', sleep: '7.5h', weight: '72.9kg', mood: '良好' },
]
</script>

<template>
  <div class="health-view">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6" v-for="item in healthData" :key="item.title">
        <el-card shadow="hover" :body-style="{ padding: '20px' }" style="border-radius: 10px">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-size: 13px; color: #909399; margin-bottom: 8px">{{ item.title }}</div>
              <div style="display: flex; align-items: baseline; gap: 4px">
                <span style="font-size: 26px; font-weight: 700; color: #303133">{{ item.value }}</span>
                <span style="font-size: 13px; color: #909399">{{ item.unit }}</span>
              </div>
            </div>
            <el-icon :size="28" :color="item.color"><component :is="item.icon" /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span class="page-title"><el-icon :size="20"><FirstAidKit /></el-icon> 健康</span>
          <el-button type="primary" :icon="'Plus'">打卡</el-button>
        </div>
      </template>
      <el-table :data="records" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="130" />
        <el-table-column prop="exercise" label="运动" min-width="140" />
        <el-table-column prop="sleep" label="睡眠" width="100" />
        <el-table-column prop="weight" label="体重" width="100" />
        <el-table-column prop="mood" label="心情" width="100">
          <template #default="{ row }">
            <el-tag :type="row.mood === '很好' ? 'success' : row.mood === '一般' ? 'warning' : 'primary'" size="small">
              {{ row.mood }}
            </el-tag>
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
