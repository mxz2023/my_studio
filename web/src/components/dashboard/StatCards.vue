<script setup>
/**
 * StatCards - 数据统计卡片组件
 *
 * Props:
 *   cards - 卡片数据数组 [{ title, value, icon, color, bg, change, up }]
 */
defineProps({
  cards: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <el-row :gutter="20" class="stat-row">
    <el-col :xs="12" :sm="12" :md="6" v-for="card in cards" :key="card.title">
      <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
        <div class="stat-card-content">
          <div class="stat-info">
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-change" :style="{ color: card.up ? '#67C23A' : '#F56C6C' }">
              <el-icon><Top v-if="card.up" /><Bottom v-else /></el-icon>
              {{ card.change }} 较上月
            </div>
          </div>
          <div class="stat-icon" :style="{ backgroundColor: card.bg }">
            <el-icon :size="28" :color="card.color">
              <component :is="card.icon" />
            </el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 10px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 6px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
