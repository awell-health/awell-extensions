import { DateTimeSchema, NumericIdSchema } from '@awell-health/extensions-core'
import {
  templateType,
  bulletCategory,
} from '../actions/createVisitNote/config/fields'
import * as z from 'zod'

export const CreateVisitNoteInputSchema = z
  .object({
    patient: NumericIdSchema,
    chart_date: DateTimeSchema,
    document_date: DateTimeSchema,
    template: templateType,
    physician: NumericIdSchema,
    bullets: z.array(
      z.object({
        text: z.string(),
        author: NumericIdSchema,
        category: bulletCategory,
      })
    ),
    type: z.string().optional(),
    confidential: z.boolean().optional(),
  })
  .strict()

export type CreateVisitNoteInputType = z.infer<
  typeof CreateVisitNoteInputSchema
>

export interface CreateVisitNoteResponseType extends CreateVisitNoteInputType {
  id: number
}
