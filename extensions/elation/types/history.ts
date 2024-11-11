import { NumericIdSchema } from '@awell-health/extensions-core'
import * as z from 'zod'

export const HistoryTypeSchema = z.enum([
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
    type: HistoryTypeSchema,
    patient: NumericIdSchema,
    text: z.string(),
  })
  .strict()

export const historyArraySchema = z.array(historySchema)

export type addHistoryInput = z.infer<typeof historySchema>
export interface addHistoryResponse extends addHistoryInput {
  id: number
  type: typeof HistoryTypeSchema
  rank: number
  text: string
  patient: number
  created_at: string
  deleted_date: string | null
}
