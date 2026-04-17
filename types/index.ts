export type TaskStatus = 'Not Started' | 'In Progress' | 'Delayed' | 'Completed'
export type TaskLevel = 'output' | 'activity' | 'task'

export interface Workplan {
  id: string
  name: string
  description: string
  share_token: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  workplan_id: string
  code: string
  level: TaskLevel
  parent_id: string | null
  position: number
  title: string
  responsible: string
  comments: string
  planned_start: string | null
  planned_end: string | null
  actual_start: string | null
  actual_end: string | null
  progress: number
  depends_on: string | null
  status?: TaskStatus
}

export interface TaskNode extends Task {
  children: TaskNode[]
}
