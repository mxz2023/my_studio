<script setup>
/**
 * BookView - 书籍管理页面
 */
const books = [
  { id: 1, title: '深入理解计算机系统', author: 'Randal E. Bryant', category: '计算机', status: '在读', progress: 65 },
  { id: 2, title: '代码整洁之道', author: 'Robert C. Martin', category: '编程', status: '已读', progress: 100 },
  { id: 3, title: '设计模式', author: 'GoF', category: '编程', status: '想读', progress: 0 },
  { id: 4, title: '人类简史', author: '尤瓦尔·赫拉利', category: '历史', status: '已读', progress: 100 },
  { id: 5, title: '原则', author: '瑞·达利欧', category: '管理', status: '在读', progress: 30 },
]
const statusType = { '在读': 'warning', '已读': 'success', '想读': 'info' }
</script>

<template>
  <div class="book-view">
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span class="page-title"><el-icon :size="20"><Reading /></el-icon> 书籍</span>
          <el-button type="primary" :icon="'Plus'">添加书籍</el-button>
        </div>
      </template>
      <el-table :data="books" stripe style="width: 100%">
        <el-table-column prop="title" label="书名" min-width="200" />
        <el-table-column prop="author" label="作者" width="160" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="阅读进度" width="160">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="row.progress === 100 ? 'success' : ''" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default>
            <el-button type="primary" link size="small">编辑</el-button>
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
