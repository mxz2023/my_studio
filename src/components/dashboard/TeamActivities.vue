<script setup>
/**
 * TeamActivities - 团队动态时间轴组件
 *
 * Props:
 *   activities - 动态数据数组 [{ user, action, target, time, avatar }]
 *
 * Events:
 *   @view-all - 点击「查看全部」时触发
 */
defineProps({
  activities: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['view-all'])

const avatarColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
</script>

<template>
  <el-card shadow="never" class="team-activities">
    <template #header>
      <div class="card-header">
        <span class="card-title">团队动态</span>
        <el-button type="primary" link @click="emit('view-all')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>
    <el-timeline>
      <el-timeline-item
        v-for="(act, idx) in activities"
        :key="idx"
        :timestamp="act.time"
        placement="top"
      >
        <div class="activity-content">
          <el-avatar :size="28" :style="{ backgroundColor: avatarColors[idx % avatarColors.length] }">
            {{ act.avatar }}
          </el-avatar>
          <span class="activity-text">
            <strong>{{ act.user }}</strong> {{ act.action }}
            <el-link type="primary" :underline="false"> {{ act.target }}</el-link>
          </span>
        </div>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<style scoped>
.team-activities {
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

.activity-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-text {
  font-size: 14px;
  color: #606266;
}
</style>
