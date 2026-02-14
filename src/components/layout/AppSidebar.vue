<script setup>
/**
 * AppSidebar - 左侧菜单栏组件
 *
 * Props:
 *   collapsed - 是否折叠
 *   menuItems - 菜单项数组 [{ index, icon, title }]
 *   activeMenu - 当前激活的菜单标识
 *
 * Events:
 *   @menu-select - 菜单项被选中时触发，参数为 index
 *   @toggle-collapse - 点击折叠按钮时触发
 */
import { computed } from 'vue'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  menuItems: {
    type: Array,
    required: true,
  },
  activeMenu: {
    type: String,
    default: 'dashboard',
  },
})

const emit = defineEmits(['menu-select', 'toggle-collapse'])

const sidebarWidth = computed(() => (props.collapsed ? '64px' : '220px'))
</script>

<template>
  <el-aside :width="sidebarWidth" class="app-sidebar">
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      class="sidebar-menu"
      @select="(index) => emit('menu-select', index)"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.index"
        :index="item.index"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-footer" @click="emit('toggle-collapse')">
      <el-icon :size="18">
        <component :is="collapsed ? 'Expand' : 'Fold'" />
      </el-icon>
      <span v-if="!collapsed" class="collapse-text">收起菜单</span>
    </div>
  </el-aside>
</template>

<style scoped>
.app-sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s, background 0.3s, border-color 0.3s;
  overflow: hidden;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--border-color);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13px;
  transition: background 0.2s, color 0.2s, border-color 0.3s;
}

.sidebar-footer:hover {
  background: var(--bg-hover);
  color: #409EFF;
}

.collapse-text {
  white-space: nowrap;
}
</style>
