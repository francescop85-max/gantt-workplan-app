import {
  computeStatus,
  computeCodes,
  indentTask,
  outdentTask,
  buildTree,
  flattenTree,
} from '@/lib/taskUtils'
import { Task } from '@/types'

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    workplan_id: 'wp-1',
    code: '',
    level: 'task',
    parent_id: null,
    position: 0,
    title: 'Test',
    responsible: '',
    comments: '',
    planned_start: null,
    planned_end: null,
    actual_start: null,
    actual_end: null,
    progress: 0,
    depends_on: null,
    ...overrides,
  }
}

describe('computeStatus', () => {
  it('returns Not Started when no dates', () => {
    expect(computeStatus(makeTask())).toBe('Not Started')
  })

  it('returns In Progress when actual_start set but no actual_end', () => {
    expect(computeStatus(makeTask({ actual_start: yesterday }))).toBe('In Progress')
  })

  it('returns Completed when actual_end is set', () => {
    expect(computeStatus(makeTask({ actual_start: yesterday, actual_end: today }))).toBe('Completed')
  })

  it('returns Delayed when today > planned_end and no actual_end', () => {
    expect(computeStatus(makeTask({ planned_end: yesterday }))).toBe('Delayed')
  })

  it('returns Not Started when planned_end is in future and no actual dates', () => {
    expect(computeStatus(makeTask({ planned_end: tomorrow }))).toBe('Not Started')
  })
})

describe('computeCodes', () => {
  it('assigns top-level codes to root tasks', () => {
    const tasks: Task[] = [
      makeTask({ id: 'a', parent_id: null, position: 0 }),
      makeTask({ id: 'b', parent_id: null, position: 1 }),
    ]
    const result = computeCodes(tasks)
    expect(result.find(t => t.id === 'a')?.code).toBe('1')
    expect(result.find(t => t.id === 'b')?.code).toBe('2')
  })

  it('assigns nested codes to child tasks', () => {
    const tasks: Task[] = [
      makeTask({ id: 'a', parent_id: null, position: 0 }),
      makeTask({ id: 'b', parent_id: 'a', position: 0 }),
      makeTask({ id: 'c', parent_id: 'a', position: 1 }),
      makeTask({ id: 'd', parent_id: 'b', position: 0 }),
    ]
    const result = computeCodes(tasks)
    expect(result.find(t => t.id === 'b')?.code).toBe('1.1')
    expect(result.find(t => t.id === 'c')?.code).toBe('1.2')
    expect(result.find(t => t.id === 'd')?.code).toBe('1.1.1')
  })
})

describe('indentTask', () => {
  it('makes a task a child of the task above it', () => {
    const tasks: Task[] = [
      makeTask({ id: 'a', parent_id: null, position: 0 }),
      makeTask({ id: 'b', parent_id: null, position: 1 }),
    ]
    const result = indentTask(tasks, 'b')
    const b = result.find(t => t.id === 'b')!
    expect(b.parent_id).toBe('a')
    expect(b.position).toBe(0)
  })

  it('does nothing if task is first in list', () => {
    const tasks: Task[] = [makeTask({ id: 'a', parent_id: null, position: 0 })]
    const result = indentTask(tasks, 'a')
    expect(result.find(t => t.id === 'a')?.parent_id).toBeNull()
  })
})

describe('outdentTask', () => {
  it('moves a child task to the parent level', () => {
    const tasks: Task[] = [
      makeTask({ id: 'a', parent_id: null, position: 0 }),
      makeTask({ id: 'b', parent_id: 'a', position: 0 }),
    ]
    const result = outdentTask(tasks, 'b')
    const b = result.find(t => t.id === 'b')!
    expect(b.parent_id).toBeNull()
  })

  it('does nothing if task is already at root level', () => {
    const tasks: Task[] = [makeTask({ id: 'a', parent_id: null, position: 0 })]
    const result = outdentTask(tasks, 'a')
    expect(result.find(t => t.id === 'a')?.parent_id).toBeNull()
  })
})
