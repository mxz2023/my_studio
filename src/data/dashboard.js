/**
 * 工作台页面的所有 mock 数据
 * 后续可替换为真实 API 调用
 */

/** 数据统计卡片 */
export const statCards = [
  { title: '项目总数', value: 128, icon: 'Folder', color: '#409EFF', bg: '#ECF5FF', change: '+12%', up: true },
  { title: '进行中任务', value: 56, icon: 'Loading', color: '#E6A23C', bg: '#FDF6EC', change: '+8%', up: true },
  { title: '已完成', value: 896, icon: 'CircleCheck', color: '#67C23A', bg: '#F0F9EB', change: '+24%', up: true },
  { title: '团队成员', value: 32, icon: 'User', color: '#909399', bg: '#F4F4F5', change: '+2', up: true },
]

/** 快捷操作 */
export const shortcuts = [
  { icon: 'Plus', title: '新建项目', color: '#409EFF' },
  { icon: 'Upload', title: '上传文件', color: '#67C23A' },
  { icon: 'EditPen', title: '写文档', color: '#E6A23C' },
  { icon: 'Share', title: '分享', color: '#F56C6C' },
  { icon: 'Download', title: '导出报表', color: '#909399' },
  { icon: 'VideoCamera', title: '视频会议', color: '#00d4aa' },
]

/** 最近项目 */
export const recentProjects = [
  { name: 'MyStudio 前端重构', status: '进行中', progress: 68, team: 5, date: '2026-02-14' },
  { name: '用户管理系统 V2', status: '进行中', progress: 45, team: 3, date: '2026-02-13' },
  { name: '数据可视化平台', status: '待启动', progress: 10, team: 4, date: '2026-02-12' },
  { name: 'API 网关优化', status: '已完成', progress: 100, team: 2, date: '2026-02-10' },
  { name: '移动端适配方案', status: '进行中', progress: 82, team: 3, date: '2026-02-09' },
]

/** 待办事项 */
export const defaultTodoList = [
  { id: 1, text: '评审前端架构设计方案', done: false, priority: 'high' },
  { id: 2, text: '完成 Q1 季度总结报告', done: false, priority: 'high' },
  { id: 3, text: '优化首页加载性能', done: true, priority: 'medium' },
  { id: 4, text: '更新 API 接口文档', done: false, priority: 'medium' },
  { id: 5, text: '组织团队周会', done: false, priority: 'low' },
  { id: 6, text: '部署测试环境', done: true, priority: 'low' },
]

/** 团队动态 */
export const activities = [
  { user: '张三', action: '创建了项目', target: 'MyStudio 前端重构', time: '10 分钟前', avatar: 'Z' },
  { user: '李四', action: '提交了代码', target: 'feat: 新增用户模块', time: '30 分钟前', avatar: 'L' },
  { user: '王五', action: '完成了任务', target: 'API 接口联调', time: '1 小时前', avatar: 'W' },
  { user: '赵六', action: '发布了版本', target: 'v2.1.0', time: '2 小时前', avatar: 'Z' },
  { user: '孙七', action: '上传了文件', target: '需求文档 V3.pdf', time: '3 小时前', avatar: 'S' },
]
