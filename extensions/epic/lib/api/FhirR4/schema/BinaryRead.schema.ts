import { z } from 'zod'
import { type Binary } from '@medplum/fhirtypes'

export const BinaryReadInputSchema = z.string()

export type BinaryReadInputType = z.infer<
  typeof BinaryReadInputSchema
>

/**
 * This is probably imperfect as Medplum's FHIR type might
 * not be fully compatible with Epic's FHIR type but good enough for now
 */
export type BinaryReadResponseType = Binary
