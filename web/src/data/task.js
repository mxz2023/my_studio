/**
 * 任务模块的 mock 数据和配置
 * 后续可替换为真实 API 调用
 */

/** 任务初始数据 */
export const defaultTasks = [
  { id: 1, title: '完成前端页面开发', status: 'doing', priority: '高', assignee: '张三', deadline: '2026-02-20', quadrant: 1 },
  { id: 2, title: '编写单元测试', status: 'todo', priority: '中', assignee: '李四', deadline: '2026-02-22', quadrant: 2 },
  { id: 3, title: '接口联调', status: 'doing', priority: '高', assignee: '王五', deadline: '2026-02-18', quadrant: 1 },
  { id: 4, title: '性能优化', status: 'todo', priority: '低', assignee: '赵六', deadline: '2026-02-28', quadrant: 4 },
  { id: 5, title: '需求文档整理', status: 'done', priority: '中', assignee: '张三', deadline: '2026-02-10', quadrant: 3 },
  { id: 6, title: '代码审查', status: 'done', priority: '高', assignee: '李四', deadline: '2026-02-12', quadrant: 2 },
]

/** 状态配置 */
export const statusOptions = [
  { value: 'todo', label: '待处理' },
  { value: 'doing', label: '进行中' },
  { value: 'done', label: '已完成' },
]

export const statusMap = { todo: '待处理', doing: '进行中', done: '已完成' }
export const statusType = { todo: 'info', doing: 'warning', done: 'success' }

/** 优先级配置 */
export const priorityOptions = [
  { value: '高', label: '高', color: '#F56C6C' },
  { value: '中', label: '中', color: '#E6A23C' },
  { value: '低', label: '低', color: '#909399' },
]

export const priorityColor = { '高': '#F56C6C', '中': '#E6A23C', '低': '#909399' }

/** 四象限配置 */
export const quadrantOptions = [
  { value: 1, label: '重要且紧急' },
  { value: 2, label: '重要不紧急' },
  { value: 3, label: '紧急不重要' },
  { value: 4, label: '不紧急不重要' },
]

export const quadrants = [
  { id: 1, label: '重要且紧急', color: '#F56C6C', bg: 'rgba(245,108,108,0.08)', border: 'rgba(245,108,108,0.25)' },
  { id: 2, label: '重要不紧急', color: '#409EFF', bg: 'rgba(64,158,255,0.08)', border: 'rgba(64,158,255,0.25)' },
  { id: 3, label: '紧急不重要', color: '#E6A23C', bg: 'rgba(230,162,60,0.08)', border: 'rgba(230,162,60,0.25)' },
  { id: 4, label: '不紧急不重要', color: '#909399', bg: 'rgba(144,147,153,0.08)', border: 'rgba(144,147,153,0.25)' },
]

/** 新建任务的空模板 */
export function createEmptyTask() {
  return {
    id: 0,
    title: '',
    status: 'todo',
    priority: '中',
    assignee: '',
    deadline: '',
    quadrant: 4,
  }
}
