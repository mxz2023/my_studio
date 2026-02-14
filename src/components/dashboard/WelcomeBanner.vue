<script setup>
/**
 * WelcomeBanner - 欢迎横幅组件
 *
 * Props:
 *   username - 用户名
 *   pendingCount - 待办数量
 */
import { computed } from 'vue'

const props = defineProps({
  username: {
    type: String,
    default: '管理员',
  },
  pendingCount: {
    type: Number,
    default: 0,
  },
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const todayText = computed(() => {
  const d = new Date()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `今天是 ${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日，${weekDays[d.getDay()]}。祝你工作顺利！`
})
</script>

<template>
  <div class="welcome-banner">
    <div class="welcome-info">
      <h2>{{ greeting }}，{{ username }}</h2>
      <p>{{ todayText }}</p>
    </div>
    <div class="welcome-extra">
      <div class="pending-card">
        <div class="pending-number">{{ pendingCount }}</div>
        <div class="pending-label">
          <el-icon :size="14"><Calendar /></el-icon>
          <span>今日待办</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: var(--banner-gradient);
  transition: background 0.3s;
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;
}

.welcome-info h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 6px;
}

.welcome-info p {
  font-size: 14px;
  opacity: 0.85;
}

.pending-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.pending-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  margin-bottom: 6px;
}

.pending-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}
</style>
