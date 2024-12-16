import { z } from 'zod'

export const careGapSchema = z.object({
  definition_id: z.string(),
  patient_id: z.string(),
  practice_id: z.string(),
  created_date: z.string().datetime(), // Consider using z.date() if you parse dates
  status: z.enum(['open', 'closed']), // Add other status values if they exist
  detail: z.string(),
  closed_date: z.string().datetime().optional(),
  closed_by: z.enum(['API', 'condition-saved', 'feedback']).optional(),
  id: z.string(),
  quality_program: z.string()
}) 