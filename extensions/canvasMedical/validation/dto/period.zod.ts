import { z } from 'zod'
import { dateTime } from './primitive'

export const periodSchema = z.object({
  start: dateTime,
  end: dateTime.optional(),
})
