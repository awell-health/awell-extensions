import { createTaskSchema } from '../createTask.zod'

describe('healthie createTaskSchema reminder (zod 4)', () => {
  const base = { content: 'Follow up', reminderTime: 9 }

  it('emits a custom invalid_date issue when type is "once" without a date', () => {
    const result = createTaskSchema.safeParse({
      ...base,
      isReminderEnabled: true,
      reminderIntervalType: 'once',
    })
    expect(result.success).toBe(false)
    const issue = result.error?.issues.find((i) => i.code === 'custom')
    expect(issue).toMatchObject({
      code: 'custom',
      path: ['reminderIntervalValueOnce'],
      message: 'Value is not a valid ISO8601 date',
      params: expect.objectContaining({ reason: 'invalid_date' }),
    })
  })

  it('accepts "once" with reminderIntervalValueOnce and builds the reminder', () => {
    const result = createTaskSchema.parse({
      ...base,
      isReminderEnabled: true,
      reminderIntervalType: 'once',
      reminderIntervalValueOnce: '2024-03-01',
    })
    expect(result.reminder).toEqual({
      is_enabled: true,
      interval_type: 'once',
      interval_value: '2024-03-01',
      reminder_time: 9,
    })
  })

  it('falls back to reminderIntervalValue for "once" (compat path)', () => {
    const result = createTaskSchema.parse({
      ...base,
      isReminderEnabled: true,
      reminderIntervalType: 'once',
      reminderIntervalValue: '2024-03-01',
    })
    expect(result.reminder?.interval_value).toBe('2024-03-01')
  })

  it('yields no reminder when the reminder is disabled', () => {
    const result = createTaskSchema.parse({ content: 'Follow up' })
    expect(result.reminder).toBeUndefined()
  })

  it('rejects an unknown weekday list for "weekly"', () => {
    const result = createTaskSchema.safeParse({
      ...base,
      isReminderEnabled: true,
      reminderIntervalType: 'weekly',
      reminderIntervalValue: 'monday, funday',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['reminderIntervalValue'])
  })
})
