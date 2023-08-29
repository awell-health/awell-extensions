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

export const questionnaireResponseSchema =
  creatingQuestionnaireResponsesSchema.extend({
    meta: z.object({
      versionId: z.string(),
      lastUpdated: z.string(),
    }),
    status: z.string(),
  })

export const questionnaireResponseWithIdSchema =
  questionnaireResponseSchema.extend({
    id: z.string(),
  })

export type CreatingQuestionnaireResponses = z.infer<
  typeof creatingQuestionnaireResponsesSchema
>

export type QuestionnaireResponse = z.infer<typeof questionnaireResponseSchema>
export type QuestionnaireResponseWithId = z.infer<
  typeof questionnaireResponseWithIdSchema
>
