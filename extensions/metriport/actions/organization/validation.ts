import { z } from 'zod'
import { addressSchema, orgTypeSchema } from '@metriport/api'

export const orgCreateSchema = z
  .object({
    name: z.string().min(1),
    type: orgTypeSchema,
  })
  .merge(addressSchema)

export const orgUpdateSchema = z
  .object({
    id: z.string().min(1),
  })
  .merge(orgCreateSchema)
