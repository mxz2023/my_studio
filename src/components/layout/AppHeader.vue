<script setup>
/**
 * AppHeader - 顶部导航栏组件
 *
 * Props:
 *   currentTitle - 当前页面标题，用于面包屑显示
 *
 * Events:
 *   @toggle-sidebar - 点击 Logo 时触发，用于切换侧边栏折叠状态
 */

defineProps({
  currentTitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['toggle-sidebar'])
</script>

<template>
  <el-header class="app-header">
    <div class="header-left">
      <div class="logo" @click="emit('toggle-sidebar')">
        <el-icon :size="24" color="#409EFF"><Monitor /></el-icon>
        <span class="logo-text">MyStudio</span>
      </div>
      <el-breadcrumb separator="/" class="header-breadcrumb">
        <el-breadcrumb-item>首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <el-input
        placeholder="搜索项目、任务、文件..."
        prefix-icon="Search"
        class="header-search"
        size="default"
        clearable
      />
      <el-badge :value="5" :max="99" class="header-badge">
        <el-button :icon="'Bell'" circle size="default" />
      </el-badge>
      <el-badge :value="3" :max="99" class="header-badge">
        <el-button :icon="'ChatDotRound'" circle size="default" />
      </el-badge>
      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar :size="32" style="background-color: #409EFF">U</el-avatar>
          <span class="user-name">管理员</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="User">个人中心</el-dropdown-item>
            <el-dropdown-item icon="Setting">系统设置</el-dropdown-item>
            <el-dropdown-item icon="SwitchButton" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: var(--bg-container);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-header);
  z-index: 100;
  transition: background 0.3s, border-color 0.3s;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
  transition: color 0.3s;
}

.header-breadcrumb {
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-search {
  width: 240px;
}

.header-badge {
  line-height: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--bg-hover);
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
  transition: color 0.3s;
}

@media (max-width: 768px) {
  .header-search {
    display: none;
  }
  .header-breadcrumb {
    display: none;
  }
}
</style>
