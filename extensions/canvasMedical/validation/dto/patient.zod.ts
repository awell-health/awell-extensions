import { z } from 'zod'
import { contactPointSchema } from './contactPoint.zod'
import { identifierSchema } from './identifier.zod'
import { addressSchema } from './address.zod'
import { base64Binary, date } from './primitive'
import { extensionSchema } from './extension.zod'
import { communicationSchema } from './communication.zod'

const humanNameSchema = z.object({
  use: z.enum(['official', 'nickname', 'maiden', 'old']),
  family: z.string(),
  given: z.array(z.string()),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
})

export const patientSchema = z.object({
  resourceType: z.literal('Patient'),
  meta: z
    .object({
      versionId: z.string(),
      lastUpdated: z.string(),
    })
    .optional(),
  text: z
    .object({
      status: z.enum(['generated']),
      div: z.string(),
    })
    .optional(),
  extension: z.array(extensionSchema),
  identifier: z.array(identifierSchema),
  active: z.boolean(),
  name: z.array(humanNameSchema),
  telecom: z.array(contactPointSchema),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: date,
  contact: z
    .array(
      z.object({
        name: z.object({
          text: z.string(),
        }),
        relationship: z.array(z.object({ text: z.string() })),
        telecom: z.array(contactPointSchema),
      })
    )
    .optional(),
  address: z.array(addressSchema).optional(),
  communication: z.array(communicationSchema).optional(),
  deceased: z.boolean().optional(),
  deceasedBoolean: z.boolean().optional(),
  photo: z.array(
    z.object({
      data: base64Binary.optional(),
      url: z.string().optional(),
    })
  ),
})

export const patientWithIdSchema = patientSchema.extend({
  id: z.string(),
})

export type Patient = z.infer<typeof patientSchema>
export type PatientWithID = z.infer<typeof patientWithIdSchema>
