import { z } from 'zod'
import { MedicalDataSource } from '@metriport/api'

export const getAllLinksSchema = z.object({
  patientId: z
    .string({ errorMap: () => ({ message: 'Missing patientId' }) })
    .min(1),
  facilityId: z
    .string({ errorMap: () => ({ message: 'Missing facilityId' }) })
    .min(1),
})

export const linkRemoveSchema = z
  .object({
    linkSource: z.nativeEnum(MedicalDataSource),
  })
  .merge(getAllLinksSchema)

export const linkCreateSchema = z
  .object({
    entityId: z
      .string({ errorMap: () => ({ message: 'Missing entityId' }) })
      .min(1),
  })
  .merge(linkRemoveSchema)
