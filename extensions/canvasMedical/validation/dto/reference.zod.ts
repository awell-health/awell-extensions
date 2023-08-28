import { z } from 'zod'

type ReferenceType = 'Patient' | 'Practitioner' | 'Location' | 'Questionnaire'

export const createReferenceSchema = (
  referenceType: ReferenceType
): z.ZodString =>
  z
    .string()
    .regex(
      new RegExp(
        `^${referenceType}/([0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}|[0-9a-zA-Z]{1,32})$`
      )
    )
