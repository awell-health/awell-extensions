import { z } from 'zod'

type ReferenceType = 'Patient' | 'Practitioner' | 'Location'

export const createReferenceSchema = (
  referenceType: ReferenceType
): z.ZodString =>
  z.string().regex(new RegExp(`^${referenceType}/[0-9a-zA-Z]{0,32}$`))
