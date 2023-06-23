import { z } from 'zod'

type ReferenceType = 'Patient' | 'Practitioner' | 'Location'

export const createReferenceSchema = (
  referenceType: ReferenceType
): z.ZodString =>
  z
    .string()
    .regex(
      new RegExp(
        `/((http|https)://([A-Za-z0-9-\\.:%$]*/)+)?${referenceType}/[A-Za-z0-9-.]{1,64}(/_history/[A-Za-z0-9-.]{1,64})?(#[A-Za-z0-9-.]{1,64})?/`
      )
    )
