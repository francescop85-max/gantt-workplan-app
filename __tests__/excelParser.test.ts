import { parseExcelRows } from '@/lib/excelParser'

describe('parseExcelRows', () => {
  it('parses a valid row into a partial Task', () => {
    const rows = [
      {
        Title: 'Set up office',
        Responsible: 'John',
        'Planned Start': '2026-05-01',
        'Planned End': '2026-05-15',
        'Actual Start': '',
        'Actual End': '',
        'Progress (%)': 50,
        'Depends On': '',
        Comments: 'First task',
        Level: 'output',
      },
    ]
    const result = parseExcelRows(rows)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Set up office')
    expect(result[0].responsible).toBe('John')
    expect(result[0].planned_start).toBe('2026-05-01')
    expect(result[0].progress).toBe(50)
    expect(result[0].level).toBe('output')
  })

  it('skips rows with no title', () => {
    const rows = [{ Title: '', Responsible: 'John' }]
    const result = parseExcelRows(rows)
    expect(result).toHaveLength(0)
  })

  it('defaults missing optional fields', () => {
    const rows = [{ Title: 'Task A' }]
    const result = parseExcelRows(rows)
    expect(result[0].progress).toBe(0)
    expect(result[0].level).toBe('task')
    expect(result[0].planned_start).toBeNull()
  })
})
