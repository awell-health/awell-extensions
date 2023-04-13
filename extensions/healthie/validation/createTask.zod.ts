import { z } from 'zod'
import { stringIsoDate } from './generic.zod'

export const createTaskSchema = z.object({
  patientId: z.string().nonempty().optional(),
  assignToUserId: z.string().nonempty().optional(),
  content: z.string().nonempty(),
  dueDate: stringIsoDate.optional(),
})
