<script setup>
/**
 * DashboardView - 工作台页面
 *
 * 职责：从数据层获取数据，组装各个独立的仪表盘子组件
 * 每个子组件通过 props 接收数据、通过 events 向上通信
 */
import { ref, computed } from 'vue'

// 数据层
import { statCards, shortcuts, recentProjects, defaultTodoList, activities } from '@/data/dashboard.js'

// 子组件
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import StatCards from '@/components/dashboard/StatCards.vue'
import ShortcutPanel from '@/components/dashboard/ShortcutPanel.vue'
import RecentProjects from '@/components/dashboard/RecentProjects.vue'
import TodoList from '@/components/dashboard/TodoList.vue'
import TeamActivities from '@/components/dashboard/TeamActivities.vue'

// 待办事项需要可变状态，从 mock 数据深拷贝初始化
const todoList = ref(defaultTodoList.map((item) => ({ ...item })))

// 未完成的待办数量
const pendingCount = computed(() => todoList.value.filter((t) => !t.done).length)

// ---- 事件处理 ----

const handleToggleTodo = (item) => {
  const target = todoList.value.find((t) => t.id === item.id)
  if (target) target.done = !target.done
}
</script>

<template>
  <div>
    <!-- 欢迎横幅 -->
    <WelcomeBanner username="管理员" :pending-count="pendingCount" />

    <!-- 数据统计 -->
    <StatCards :cards="statCards" />

    <!-- 快捷操作 -->
    <ShortcutPanel :shortcuts="shortcuts" />

    <!-- 双列：最近项目 + 待办事项 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="14">
        <RecentProjects :projects="recentProjects" />
      </el-col>
      <el-col :xs="24" :md="10">
        <TodoList :items="todoList" @toggle="handleToggleTodo" />
      </el-col>
    </el-row>

    <!-- 团队动态 -->
    <TeamActivities :activities="activities" />
  </div>
</template>
