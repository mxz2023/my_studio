<script setup>
/**
 * App.vue - 纯布局外壳
 *
 * 职责：只负责 上(Header) + 左(Sidebar) + 右(Main) 的布局编排
 * 通过 vue-router 驱动右侧内容区切换
 */
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 布局组件
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

// 数据配置
import { menuItems } from '@/data/menu.js'

// 主题（初始化，确保刷新后主题恢复）
import { useTheme } from '@/composables/useTheme.js'
useTheme()

const route = useRoute()
const router = useRouter()

// 布局状态
const sidebarCollapsed = ref(false)

// 当前激活菜单 = 路由 name，保持菜单高亮与路由同步
const activeMenu = computed(() => route.name || 'dashboard')

// 当前页面标题，从路由 meta 或菜单配置中获取
const currentTitle = computed(() => {
  const item = menuItems.find((m) => m.index === route.name)
  return item?.title || route.meta?.title || ''
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleMenuSelect = (index) => {
  router.push({ name: index })
}
</script>

<template>
  <el-container class="layout-container" direction="vertical">
    <!-- 顶部 -->
    <AppHeader :current-title="currentTitle" @toggle-sidebar="toggleSidebar" />

    <el-container class="layout-body">
      <!-- 左侧 -->
      <AppSidebar
        :collapsed="sidebarCollapsed"
        :menu-items="menuItems"
        :active-menu="activeMenu"
        @menu-select="handleMenuSelect"
        @toggle-collapse="toggleSidebar"
      />

      <!-- 右侧主内容区：由路由驱动 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: var(--bg-page);
  transition: background-color 0.3s;
}

.layout-main {
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-page);
  transition: background-color 0.3s;
}
</style>
