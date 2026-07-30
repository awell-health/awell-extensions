import { type Bundle } from '@medplum/fhirtypes'
import { awellPatientReference } from './constants'

/** Maps a Metriport `<ResourceType>/<id>` reference to its rewritten form. */
export type ReferenceMap = Record<string, string>

/**
 * Metriport emits internal references using its own resource ids
 * (`"reference": "Patient/78a4d9e5-…"`), which resolve to nothing in Medplum.
 * This builds the lookup used to rewrite them:
 *
 * - the Patient becomes a conditional reference on the Awell identifier, since
 *   Medplum already holds that record and it is not part of the transaction
 * - everything else becomes the entry's own `fullUrl`, resolved by the
 *   transaction to whatever that entry created or updated
 *
 * Metriport's ids already line up across the bundle; what does not line up is
 * the *form*. Metriport emits `urn:uuid:<id>` fullUrls but `<Type>/<id>`
 * references, and FHIR resolves an intra-bundle reference by matching it
 * against `fullUrl` verbatim — a relative reference does not match a
 * `urn:uuid:` fullUrl. Rewriting to the fullUrl closes that gap without
 * inventing identity of our own.
 */
export const buildReferenceMap = (
  bundle: Bundle,
  awellPatientId: string,
): ReferenceMap => {
  const map: ReferenceMap = {}

  for (const entry of bundle.entry ?? []) {
    const resource = entry.resource
    if (resource?.id === undefined) continue

    const key = `${resource.resourceType}/${resource.id}`
    map[key] =
      resource.resourceType === 'Patient'
        ? awellPatientReference(awellPatientId)
        : // Metriport always sends one; the urn is only a fallback for a
          // bundle that omits it.
          entry.fullUrl ?? `urn:uuid:${resource.id}`
  }

  return map
}

/**
 * Recursively rewrites every `reference` field found in the map, returning a
 * new object. Only the `reference` key is considered, so values that merely
 * look like references (a `display` of "Patient/123", say) are left alone, as
 * are absolute URLs and references to resources outside the bundle.
 */
export const rewriteReferences = <T>(value: T, map: ReferenceMap): T => {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteReferences(item, map)) as unknown as T
  }

  if (value === null || typeof value !== 'object') return value

  const result: Record<string, unknown> = {}

  for (const [key, child] of Object.entries(value)) {
    if (key === 'reference' && typeof child === 'string') {
      result[key] = map[child] ?? child
    } else {
      result[key] = rewriteReferences(child, map)
    }
  }

  return result as T
}
