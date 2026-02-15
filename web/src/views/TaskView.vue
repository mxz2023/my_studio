<script setup>
/**
 * TaskView - 任务管理页面
 */
import { ref, computed, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  defaultTasks,
  statusMap,
  statusType,
  priorityColor,
  statusOptions,
  priorityOptions,
  quadrantOptions,
  quadrants,
  createEmptyTask,
} from '@/data/task.js'

const tasks = ref(defaultTasks.map((t) => ({ ...t })))

// ===== 新建 / 编辑任务 =====
const dialogVisible = ref(false)
const dialogMode = ref('create') // 'create' | 'edit'
const taskFormRef = ref(null)
const taskForm = reactive(createEmptyTask())

const taskRules = {
  title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
}

const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新建任务' : '编辑任务'))

let nextId = tasks.value.length > 0 ? Math.max(...tasks.value.map((t) => t.id)) + 1 : 1

function resetForm(data) {
  Object.assign(taskForm, data)
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetForm(createEmptyTask())
  dialogVisible.value = true
  nextTick(() => taskFormRef.value?.clearValidate())
}

function openEditDialog(row) {
  dialogMode.value = 'edit'
  resetForm({ ...row })
  dialogVisible.value = true
  nextTick(() => taskFormRef.value?.clearValidate())
}

async function handleSubmit() {
  try {
    await taskFormRef.value.validate()
  } catch {
    return
  }
  if (dialogMode.value === 'create') {
    tasks.value.push({ ...taskForm, id: nextId++ })
    ElMessage.success('任务创建成功')
  } else {
    const idx = tasks.value.findIndex((t) => t.id === taskForm.id)
    if (idx !== -1) {
      tasks.value.splice(idx, 1, { ...taskForm })
      ElMessage.success('任务更新成功')
    }
  }
  dialogVisible.value = false
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除任务「${row.title}」吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const idx = tasks.value.findIndex((t) => t.id === row.id)
    if (idx !== -1) tasks.value.splice(idx, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// ===== 自定义日历 =====
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const selectedDate = ref(formatDate(today))

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const monthLabel = computed(() => `${currentYear.value} 年 ${currentMonth.value + 1} 月`)

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

// 生成日历网格
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  // 周一为起始：0=周一 ... 6=周日
  let startWeekday = firstDay.getDay() - 1
  if (startWeekday < 0) startWeekday = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days = []

  // 上月填充
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    days.push({ day: d, date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, outside: true })
  }

  // 本月
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, outside: false })
  }

  // 下月填充（补满 6 行 = 42 格，或至少补到完整行）
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1
    const y = month === 11 ? year + 1 : year
    days.push({ day: d, date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, outside: true })
  }

  return days
})

// 每个日期对应的任务列表
const tasksByDate = computed(() => {
  const map = {}
  tasks.value.forEach((t) => {
    if (!map[t.deadline]) map[t.deadline] = []
    map[t.deadline].push(t)
  })
  return map
})

const todayStr = formatDate(today)

function isToday(dateStr) { return dateStr === todayStr }
function isSelected(dateStr) { return dateStr === selectedDate.value }
function getDateTasks(dateStr) { return tasksByDate.value[dateStr] || [] }

function prevMonth() {
  if (currentMonth.value === 0) { currentYear.value--; currentMonth.value = 11 }
  else currentMonth.value--
}

function nextMonth() {
  if (currentMonth.value === 11) { currentYear.value++; currentMonth.value = 0 }
  else currentMonth.value++
}

function goToday() {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  selectedDate.value = todayStr
}

function selectDate(d) {
  selectedDate.value = d.date
}

// 选中日期的任务
const selectedDayTasks = computed(() => getDateTasks(selectedDate.value))

// ===== 四象限 =====
const tasksByQuadrant = computed(() => {
  const map = { 1: [], 2: [], 3: [], 4: [] }
  tasks.value.forEach((t) => { if (t.quadrant && map[t.quadrant]) map[t.quadrant].push(t) })
  return map
})
</script>

<template>
  <div class="task-view">
    <!-- 展示区：日历 + 四象限 -->
    <el-row :gutter="20" class="overview-row">
      <!-- 左侧日历 -->
      <el-col :xs="24" :md="10">
        <el-card shadow="never" class="section-card calendar-card">
          <!-- 日历头部 -->
          <div class="cal-header">
            <button class="cal-nav-btn" @click="prevMonth">
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <div class="cal-header-center">
              <span class="cal-month-label">{{ monthLabel }}</span>
              <button class="cal-today-btn" @click="goToday">今天</button>
            </div>
            <button class="cal-nav-btn" @click="nextMonth">
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>

          <!-- 星期头 -->
          <div class="cal-weekdays">
            <div v-for="w in weekDays" :key="w" class="cal-weekday">{{ w }}</div>
          </div>

          <!-- 日期网格 -->
          <div class="cal-grid">
            <div
              v-for="(d, idx) in calendarDays"
              :key="idx"
              class="cal-day"
              :class="{
                'is-outside': d.outside,
                'is-today': isToday(d.date),
                'is-selected': isSelected(d.date),
                'has-task': getDateTasks(d.date).length > 0,
              }"
              @click="selectDate(d)"
            >
              <span class="cal-day-num">{{ d.day }}</span>
              <!-- 任务指示器 -->
              <div v-if="getDateTasks(d.date).length > 0 && !d.outside" class="cal-task-dots">
                <span
                  v-for="(t, ti) in getDateTasks(d.date).slice(0, 3)"
                  :key="ti"
                  class="cal-dot"
                  :style="{ background: priorityColor[t.priority] || '#409EFF' }"
                ></span>
              </div>
            </div>
          </div>

          <!-- 选中日期的任务详情 -->
          <div class="cal-detail">
            <div class="cal-detail-header">
              <span class="cal-detail-date">{{ selectedDate }}</span>
              <el-tag size="small" type="info" round>{{ selectedDayTasks.length }} 项任务</el-tag>
            </div>
            <div v-if="selectedDayTasks.length > 0" class="cal-detail-list">
              <div v-for="t in selectedDayTasks" :key="t.id" class="cal-detail-item">
                <span class="cal-detail-dot" :style="{ background: priorityColor[t.priority] }"></span>
                <span class="cal-detail-title">{{ t.title }}</span>
                <el-tag :type="statusType[t.status]" size="small">{{ statusMap[t.status] }}</el-tag>
              </div>
            </div>
            <div v-else class="cal-detail-empty">
              <el-icon :size="16"><Calendar /></el-icon> 当天暂无任务
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧四象限 -->
      <el-col :xs="24" :md="14">
        <el-card shadow="never" class="section-card matrix-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon :size="18"><Grid /></el-icon> 任务四象限
              </span>
            </div>
          </template>
          <div class="matrix-wrapper">
            <!-- Y 轴 -->
            <div class="axis-y">
              <div class="axis-y-label">重要</div>
              <div class="axis-y-arrow"></div>
              <div class="axis-y-line"></div>
            </div>
            <!-- X 轴 -->
            <div class="axis-x">
              <div class="axis-x-line"></div>
              <div class="axis-x-arrow"></div>
              <div class="axis-x-label">紧急</div>
            </div>
            <!-- 四象限网格 -->
            <div class="matrix-grid">
              <div
                v-for="q in quadrants"
                :key="q.id"
                class="matrix-cell"
                :style="{ backgroundColor: q.bg, borderColor: q.border }"
              >
                <div class="matrix-label" :style="{ color: q.color }">{{ q.label }}</div>
                <div class="matrix-tasks">
                  <div
                    v-for="task in tasksByQuadrant[q.id]"
                    :key="task.id"
                    class="matrix-task-item"
                    :style="{ borderLeftColor: q.color }"
                  >
                    <span class="matrix-task-title">{{ task.title }}</span>
                    <el-tag :type="statusType[task.status]" size="small" class="matrix-task-tag">{{ statusMap[task.status] }}</el-tag>
                  </div>
                  <div v-if="tasksByQuadrant[q.id].length === 0" class="matrix-empty">暂无任务</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span class="page-title"><el-icon :size="20"><List /></el-icon> 任务</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon> 新建任务
          </el-button>
        </div>
      </template>
      <el-table :data="tasks" stripe style="width: 100%">
        <el-table-column prop="title" label="任务名称" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90" align="center">
          <template #default="{ row }">
            <span :style="{ color: priorityColor[row.priority], fontWeight: 600 }">{{ row.priority }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="负责人" width="100" />
        <el-table-column prop="deadline" label="截止日期" width="130" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建 / 编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form ref="taskFormRef" :model="taskForm" :rules="taskRules" label-width="90px" label-position="right">
        <el-form-item label="任务名称" prop="title">
          <el-input v-model="taskForm.title" placeholder="请输入任务名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="taskForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="taskForm.priority">
            <el-radio-button
              v-for="opt in priorityOptions"
              :key="opt.value"
              :value="opt.value"
              :class="{ 'is-active-priority': taskForm.priority === opt.value }"
            >
              <span class="priority-label" :data-color="opt.color" :style="{ '--priority-color': opt.color }">{{ opt.label }}</span>
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-input v-model="taskForm.assignee" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="taskForm.deadline"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择截止日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="四象限" prop="quadrant">
          <el-select v-model="taskForm.quadrant" placeholder="请选择象限" style="width: 100%">
            <el-option
              v-for="opt in quadrantOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">{{ dialogMode === 'create' ? '创建' : '保存' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 优先级单选按钮文字颜色 */
.priority-label {
  font-weight: 600;
  color: var(--priority-color);
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) .priority-label {
  color: #fff !important;
}

.section-card { border-radius: 10px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 16px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; transition: color 0.3s; }
.card-title { font-size: 15px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; transition: color 0.3s; }
.overview-row { margin-bottom: 20px; display: flex; align-items: stretch; }
.overview-row :deep(.el-col) { display: flex; }
.overview-row .section-card { flex: 1; display: flex; flex-direction: column; }
.overview-row .matrix-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; }

/* ===== 自定义日历 ===== */
.calendar-card :deep(.el-card__body) {
  padding: 20px;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.cal-header-center {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cal-month-label {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s;
}

.cal-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-container);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.cal-nav-btn:hover {
  background: var(--bg-hover);
  border-color: #409EFF;
  color: #409EFF;
}

.cal-today-btn {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.cal-today-btn:hover {
  border-color: #409EFF;
  color: #409EFF;
}

/* 星期头 */
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
}

.cal-weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 6px 0;
}

/* 日期网格 */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.cal-day:hover {
  background: var(--bg-hover);
}

.cal-day-num {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1;
  transition: color 0.3s;
}

/* 非本月日期 */
.cal-day.is-outside .cal-day-num {
  color: var(--text-placeholder);
}

/* 今天 */
.cal-day.is-today {
  background: rgba(64, 158, 255, 0.08);
}

.cal-day.is-today .cal-day-num {
  color: #409EFF;
  font-weight: 700;
}

/* 选中日期 */
.cal-day.is-selected {
  background: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
}

.cal-day.is-selected .cal-day-num {
  color: #fff;
  font-weight: 700;
}

.cal-day.is-selected .cal-dot {
  background: #fff !important;
}

/* 任务指示器 */
.cal-task-dots {
  display: flex;
  gap: 3px;
  margin-top: 3px;
}

.cal-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 选中日期详情 */
.cal-detail {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
  transition: border-color 0.3s;
}

.cal-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cal-detail-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s;
}

.cal-detail-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cal-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--bg-hover);
  transition: background 0.3s;
}

.cal-detail-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cal-detail-title {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s;
}

.cal-detail-empty {
  text-align: center;
  padding: 12px 0;
  font-size: 13px;
  color: var(--text-placeholder);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* ===== 四象限矩阵 ===== */
.matrix-card :deep(.el-card__body) { padding: 20px; flex: 1; display: flex; flex-direction: column; }

.matrix-wrapper {
  flex: 1;
  position: relative;
  padding-left: 32px;
  padding-bottom: 32px;
  padding-top: 20px;
  padding-right: 0;
  overflow: hidden;
}

/* ---- Y 轴（重要） ---- */
.axis-y {
  position: absolute;
  left: 14px;
  top: 20px;
  bottom: 32px;
  width: 0;
}

.axis-y-line {
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #409EFF 0%, var(--border-color) 100%);
  border-radius: 1px;
}

.axis-y-arrow {
  position: absolute;
  left: -4px;
  top: 0;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 8px solid #409EFF;
}

.axis-y-label {
  position: absolute;
  left: 50%;
  top: -18px;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  color: #409EFF;
}

/* ---- X 轴（紧急） ---- */
.axis-x {
  position: absolute;
  left: 32px;
  right: 0;
  bottom: 14px;
  height: 0;
}

.axis-x-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--border-color) 0%, #F56C6C 100%);
  border-radius: 1px;
}

.axis-x-arrow {
  position: absolute;
  right: 34px;
  top: -4px;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid #F56C6C;
}

.axis-x-label {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  color: #F56C6C;
}

/* ---- 网格 ---- */
.matrix-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  height: 100%;
}

.matrix-cell {
  border-radius: 8px;
  border: 1px solid;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.matrix-label { font-size: 12px; font-weight: 700; margin-bottom: 8px; white-space: nowrap; }

.matrix-tasks { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }

.matrix-task-item {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
  padding: 5px 8px; background: rgba(255, 255, 255, 0.06);
  border-left: 3px solid; border-radius: 4px; font-size: 12px;
}

.matrix-task-title {
  flex: 1; color: var(--text-primary); overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}

.matrix-task-tag { flex-shrink: 0; }

.matrix-empty { font-size: 12px; color: var(--text-placeholder); text-align: center; padding: 10px 0; }
</style>
