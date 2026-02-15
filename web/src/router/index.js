import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: '工作台' },
  },
  {
    path: '/ai-assistant',
    name: 'ai-assistant',
    component: () => import('@/views/AiAssistantView.vue'),
    meta: { title: '大模型助手' },
  },
  {
    path: '/task',
    name: 'task',
    component: () => import('@/views/TaskView.vue'),
    meta: { title: '任务' },
  },
  {
    path: '/book',
    name: 'book',
    component: () => import('@/views/BookView.vue'),
    meta: { title: '书籍' },
  },
  {
    path: '/finance',
    name: 'finance',
    component: () => import('@/views/FinanceView.vue'),
    meta: { title: '财务' },
  },
  {
    path: '/health',
    name: 'health',
    component: () => import('@/views/HealthView.vue'),
    meta: { title: '健康' },
  },
  {
    path: '/travel',
    name: 'travel',
    component: () => import('@/views/TravelView.vue'),
    meta: { title: '旅行' },
  },
  {
    path: '/setting',
    name: 'setting',
    component: () => import('@/views/SettingView.vue'),
    meta: { title: '设置' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
