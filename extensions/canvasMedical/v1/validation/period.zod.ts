import { z } from 'zod'
import { dateTime } from './dateTime.zod'

export const periodSchema = z.object({
  start: dateTime,
  end: dateTime.optional(),
})
