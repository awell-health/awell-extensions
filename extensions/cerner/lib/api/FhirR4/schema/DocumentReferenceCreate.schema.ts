import { type DocumentReference } from '@medplum/fhirtypes'

/**
 * This is probably imperfect as Medplum's FHIR type might
 * not be fully compatible with Epic's FHIR type but good enough for now
 */
export type DocumentReferenceCreateInputType = Partial<DocumentReference>

export type DocumentReferenceCreateResponseType = DocumentReference
