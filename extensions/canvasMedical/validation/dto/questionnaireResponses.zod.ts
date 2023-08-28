import { z } from 'zod'
import { createReferenceSchema } from './reference.zod'

export const creatingQuestionnaireResponsesSchema = z.object({
  resourceType: z.literal('QuestionnaireResponse'),
  questionnaire: createReferenceSchema('Questionnaire'),
  subject: z.object({
    reference: createReferenceSchema('Patient'),
  }),
  authored: z.string().optional(),
  author: z
    .object({
      reference: createReferenceSchema('Practitioner'),
    })
    .optional(),
  item: z.array(z.any()),
})

export type CreatingQuestionnaireResponses = z.infer<
  typeof creatingQuestionnaireResponsesSchema
>
