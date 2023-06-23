import { z } from 'zod'
import { contactPointSchema } from './contactPoint.zod'
import { identifierSchema } from './identifier.zod'
import { addressSchema } from './address.zod'
import { base64Binary, date } from './primitive'

const humanNameSchema = z.object({
  use: z.enum(['official', 'nickname', 'maiden', 'old']),
  family: z.string(),
  given: z.array(z.string()),
  prefix: z.string(),
  suffix: z.string(),
})

export const patientSchema = z.object({
  resourceType: z.literal('Patient'),
  identifier: z.array(identifierSchema),
  active: z.boolean(),
  name: z.array(humanNameSchema),
  telecom: z.array(contactPointSchema),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: date,
  contact: z.array(
    z.object({
      name: z.object({
        text: z.string(),
      }),
      relationship: z.array(z.object({ text: z.string() })),
      telecom: z.array(contactPointSchema),
    })
  ),
  address: z.array(addressSchema),
  deceased: z.boolean(),
  photo: z.array(
    z.object({
      data: base64Binary,
    })
  ),
})

export const patientWithIdSchema = patientSchema.extend({
  id: z.string(),
})

export type Patient = z.infer<typeof patientSchema>
