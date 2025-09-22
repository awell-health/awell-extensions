import { z } from 'zod'
import { type DocumentReference } from '@medplum/fhirtypes'

export const DocumentReferenceReadInputSchema = z.string()

export type DocumentReferenceReadInputType = z.infer<
  typeof DocumentReferenceReadInputSchema
>

/**
 * This is probably imperfect as Medplum's FHIR type might
 * not be fully compatible with Epic's FHIR type but good enough for now
 */
export type DocumentReferenceReadResponseType = DocumentReference
