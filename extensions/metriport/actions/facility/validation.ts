import { z } from 'zod'
import { addressSchema } from '@metriport/api'

export const facilityCreateSchema = z
  .object({
    name: z.string().min(1),
    npi: z.string().min(1),
    tin: z.string().optional().nullable(),
    active: z.boolean().optional().nullable(),
  })
  .merge(addressSchema)

export const facilityUpdateSchema = z
  .object({
    id: z.string().min(1),
  })
  .merge(facilityCreateSchema)
