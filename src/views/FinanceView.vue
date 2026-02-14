<script setup>
/**
 * FinanceView - 财务管理页面
 */
const records = [
  { id: 1, date: '2026-02-14', type: '支出', category: '餐饮', amount: -128, remark: '午餐聚餐' },
  { id: 2, date: '2026-02-13', type: '收入', category: '工资', amount: 25000, remark: '2月工资' },
  { id: 3, date: '2026-02-12', type: '支出', category: '交通', amount: -56, remark: '打车' },
  { id: 4, date: '2026-02-11', type: '支出', category: '购物', amount: -899, remark: '购买键盘' },
  { id: 5, date: '2026-02-10', type: '收入', category: '理财', amount: 320, remark: '基金收益' },
]

const summaryData = [
  { title: '本月收入', value: '¥25,320', color: '#67C23A', icon: 'TrendCharts' },
  { title: '本月支出', value: '¥3,083', color: '#F56C6C', icon: 'Wallet' },
  { title: '本月结余', value: '¥22,237', color: '#409EFF', icon: 'Coin' },
]
</script>

<template>
  <div class="finance-view">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8" v-for="item in summaryData" :key="item.title">
        <el-card shadow="hover" :body-style="{ padding: '20px' }" style="border-radius: 10px">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-size: 13px; color: #909399; margin-bottom: 8px">{{ item.title }}</div>
              <div style="font-size: 24px; font-weight: 700" :style="{ color: item.color }">{{ item.value }}</div>
            </div>
            <el-icon :size="32" :color="item.color"><component :is="item.icon" /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span class="page-title"><el-icon :size="20"><Wallet /></el-icon> 财务</span>
          <el-button type="primary" :icon="'Plus'">记一笔</el-button>
        </div>
      </template>
      <el-table :data="records" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="130" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === '收入' ? 'success' : 'danger'" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="amount" label="金额" width="130">
          <template #default="{ row }">
            <span :style="{ color: row.amount > 0 ? '#67C23A' : '#F56C6C', fontWeight: 600 }">
              {{ row.amount > 0 ? '+' : '' }}{{ row.amount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" />
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
