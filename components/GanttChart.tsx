'use client'
import { useEffect, useRef } from 'react'
import { Task } from '@/types'
import { computeStatus } from '@/lib/taskUtils'

interface GanttTask {
  id: string
  name: string
  start: string
  end: string
  progress: number
  dependencies: string
  custom_class?: string
}

interface Props {
  tasks: Task[]
  viewMode?: 'Day' | 'Week' | 'Month'
  onDateChange?: (taskId: string, start: Date, end: Date) => void
}

function taskToGantt(task: Task): GanttTask | null {
  if (!task.planned_start || !task.planned_end) return null
  const status = computeStatus(task)
  let customClass = ''
  if (status === 'Delayed') customClass = 'bar-delayed'
  else if (status === 'Completed') customClass = 'bar-completed'
  else if (status === 'In Progress') customClass = 'bar-in-progress'

  return {
    id: task.id,
    name: `${task.code} ${task.title}`,
    start: task.planned_start,
    end: task.planned_end,
    progress: task.progress,
    dependencies: task.depends_on ?? '',
    custom_class: customClass,
  }
}

export default function GanttChart({ tasks, viewMode = 'Week', onDateChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ganttTasks = tasks.map(taskToGantt).filter(Boolean) as GanttTask[]
    if (!ganttTasks.length) return

    import('frappe-gantt').then(({ default: Gantt }) => {
      if (ganttRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ganttRef.current as any).refresh(ganttTasks)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(ganttRef.current as any).change_view_mode(viewMode)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ganttRef.current = new (Gantt as any)(containerRef.current!, ganttTasks, {
          view_mode: viewMode,
          date_format: 'YYYY-MM-DD',
          popup_trigger: 'mouseover',
          on_date_change: (task: GanttTask, start: Date, end: Date) => {
            onDateChange?.(task.id, start, end)
          },
          custom_popup_html: (task: GanttTask) => {
            const original = tasks.find(t => t.id === task.id)
            if (!original) return ''
            const status = computeStatus(original)
            return `
              <div style="padding:10px;font-size:13px;line-height:1.7;min-width:210px;background:white;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
                <strong style="color:#111">${original.code} ${original.title}</strong><br/>
                <span style="color:#555">Responsible: ${original.responsible || '—'}</span><br/>
                <span style="color:#555">Planned: ${original.planned_start} → ${original.planned_end}</span><br/>
                ${original.actual_start ? `<span style="color:#555">Actual: ${original.actual_start} → ${original.actual_end || 'ongoing'}</span><br/>` : ''}
                <span style="color:#555">Progress: ${original.progress}%</span><br/>
                <span style="color:#555">Status: <strong>${status}</strong></span>
                ${original.comments ? `<br/><em style="color:#888">${original.comments}</em>` : ''}
              </div>`
          },
        })
      }
    })
  }, [tasks, viewMode, onDateChange])

  return (
    <div className="overflow-x-auto">
      <div ref={containerRef} />
    </div>
  )
}
