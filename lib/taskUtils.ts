import { Task, TaskStatus, TaskLevel, TaskNode } from '@/types'

export function computeStatus(task: Task): TaskStatus {
  if (task.actual_end) return 'Completed'
  if (task.actual_start) return 'In Progress'
  if (task.planned_end && new Date(task.planned_end) < new Date(new Date().toISOString().split('T')[0])) {
    return 'Delayed'
  }
  return 'Not Started'
}

export function computeLevel(depth: number): TaskLevel {
  if (depth === 0) return 'output'
  if (depth === 1) return 'activity'
  return 'task'
}

export function buildTree(tasks: Task[]): TaskNode[] {
  const map = new Map<string, TaskNode>()
  tasks.forEach(t => map.set(t.id, { ...t, children: [] }))
  const roots: TaskNode[] = []
  tasks
    .slice()
    .sort((a, b) => a.position - b.position)
    .forEach(t => {
      const node = map.get(t.id)!
      if (t.parent_id && map.has(t.parent_id)) {
        map.get(t.parent_id)!.children.push(node)
      } else {
        roots.push(node)
      }
    })
  return roots
}

export function flattenTree(nodes: TaskNode[]): Task[] {
  const result: Task[] = []
  function walk(node: TaskNode) {
    result.push(node)
    node.children.forEach(walk)
  }
  nodes.forEach(walk)
  return result
}

export function computeCodes(tasks: Task[]): Task[] {
  const tree = buildTree(tasks)
  const updated = new Map<string, string>()

  function walk(nodes: TaskNode[], prefix: string) {
    nodes
      .slice()
      .sort((a, b) => a.position - b.position)
      .forEach((node, i) => {
        const code = prefix ? `${prefix}.${i + 1}` : `${i + 1}`
        updated.set(node.id, code)
        walk(node.children, code)
      })
  }

  walk(tree, '')
  return tasks.map(t => ({ ...t, code: updated.get(t.id) ?? t.code }))
}

export function indentTask(tasks: Task[], taskId: string): Task[] {
  const flat = tasks.slice().sort((a, b) => {
    if (a.parent_id === b.parent_id) return a.position - b.position
    return 0
  })
  const idx = flat.findIndex(t => t.id === taskId)
  if (idx === 0) return tasks

  const target = flat[idx]
  const siblingsAbove = flat.filter(
    t => t.parent_id === target.parent_id && t.position < target.position
  )
  if (siblingsAbove.length === 0) return tasks

  const newParent = siblingsAbove[siblingsAbove.length - 1]
  const newSiblings = tasks.filter(t => t.parent_id === newParent.id)
  const newPosition = newSiblings.length

  return tasks.map(t =>
    t.id === taskId ? { ...t, parent_id: newParent.id, position: newPosition } : t
  )
}

export function outdentTask(tasks: Task[], taskId: string): Task[] {
  const target = tasks.find(t => t.id === taskId)
  if (!target || !target.parent_id) return tasks

  const parent = tasks.find(t => t.id === target.parent_id)
  if (!parent) return tasks

  const grandparentId = parent.parent_id
  const newPosition = parent.position + 1

  return tasks.map(t => {
    if (t.id === taskId) return { ...t, parent_id: grandparentId, position: newPosition }
    if (t.parent_id === grandparentId && t.position >= newPosition && t.id !== taskId) {
      return { ...t, position: t.position + 1 }
    }
    return t
  })
}
