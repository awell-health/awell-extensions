import { NumericIdSchema } from '@awell-health/extensions-core'
import * as z from 'zod'

export const HistoryTypes = z.enum([
  'Past',
  'Family',
  'Social',
  'Habits',
  'Diet',
  'Exercise',
  'Immunization',
  'Legal',
  'Consultation',
  'Health Maintenance',
  'Past Surgical',
  'Cognitive Status',
  'Functional Status',
])

export const historySchema = z
  .object({
    type: HistoryTypes,
    patient: NumericIdSchema,
    text: z.string(),
  })
  .strict()

export type addHistoryInput = z.infer<typeof historySchema>
export interface addHistoryResponse {
  id: number
  type: typeof HistoryTypes
  rank: number
  text: string
  patient: number
  created_at: string
  deleted_date: string | null
}
