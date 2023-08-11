import { z } from 'zod'
import { identifierSchema } from './identifier.zod'
import { addressSchema } from './address.zod'
import { extensionSchema } from './extension.zod'

const nameSchema = z.object({
  use: z.string(),
  family: z.string().optional(),
  given: z.array(z.string()).min(1),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
})

const telecomSchema = z.object({
  id: z.string().optional(),
  extension: z
    .array(
      z.object({
        url: z.string(),
        valueBoolean: z.boolean(),
      })
    )
    .optional(),
  system: z.string(),
  value: z.string(),
  use: z.string().optional(),
  rank: z.number().optional(),
})

const contactSchema = z.object({
  name: z.object({
    text: z.string(),
  }),
  relationship: z
    .array(
      z.object({
        text: z.string(),
      })
    )
    .optional(),
  telecom: z
    .array(
      z.object({
        system: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  extension: z
    .array(
      z.object({
        url: z.string(),
        valueBoolean: z.boolean(),
      })
    )
    .optional(),
})

const photoSchema = z.object({
  data: z.string(),
})

export const patientSchema = z.object({
  resourceType: z.literal('Patient'),
  extension: z.array(extensionSchema).optional(),
  identifier: z.array(identifierSchema).optional(),
  active: z.boolean().optional(),
  name: z.array(nameSchema),
  telecom: z.array(telecomSchema).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.union([
    z.string().regex(/^\d{4}$/),
    z.string().regex(/^\d{4}-\d{2}$/),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]),
  contact: z.array(contactSchema).optional(),
  address: z.array(addressSchema).optional(),
  deceased: z.boolean().optional(),
  photo: z.array(photoSchema).optional(),
})

export const patientWithIdSchema = patientSchema.extend({
  id: z.string(),
})

export type Patient = z.infer<typeof patientSchema>
export type PatientWithId = z.infer<typeof patientWithIdSchema>
