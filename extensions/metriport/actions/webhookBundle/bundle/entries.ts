import {
  type BundleEntry,
  type Identifier,
  type Resource,
} from '@medplum/fhirtypes'
import { type Helpers } from '@awell-health/extensions-core'
import {
  RESOURCE_TYPES_WITHOUT_IDENTIFIER,
  metriportIdentifierSystem,
} from './constants'

/**
 * Turns a Metriport resource into an executable bundle entry.
 *
 * The resource is stamped with an identifier derived from its Metriport id and
 * written with a conditional update, which makes the import idempotent: a
 * redelivered notification updates in place instead of creating duplicates, and
 * admit + discharge notifications converge on the same Encounter. Full
 * replacement is the right semantic here, since Metriport is the source of
 * truth for these resources.
 *
 * Two fields are removed:
 * - `id`, because the server assigns identity — `fullUrl` carries the local
 *   identity the transaction needs to resolve references
 * - `meta`, because specifying it at all causes Medplum to overwrite the
 *   `meta.accounts` a resource would otherwise inherit from the patient's
 *   compartment. Metriport's Encounter arrives with one.
 *
 * `fullUrl` is Metriport's own, passed through untouched, so the local identity
 * in the transaction is the one Metriport already assigned rather than
 * something we invent. The `urn:uuid:` fallback only covers a bundle that omits
 * it — which Metriport's encounter bundles do not.
 *
 * Resource types with no `identifier` element in FHIR R4 cannot be addressed by
 * a conditional update, so they fall back to POST.
 *
 * `identifier` is 0..* per the FHIR spec, but Metriport resources have been
 * seen with a single object instead of an array. That's non-conformant data,
 * not a shape we can confidently normalize, so it is left untouched rather
 * than being recast into a list and appended to. The conditional update is
 * still attempted, but since the resource never receives our stamp, it won't
 * be found on redelivery — this case is not reconciled idempotently.
 */
export const buildResourceEntry = (
  resource: Resource,
  fullUrl?: string,
  log?: Helpers['log'],
): BundleEntry => {
  const { id, resourceType } = resource

  if (id === undefined) {
    throw new Error(
      `[Metriport bundle] ${resourceType} entry is missing an id, so it cannot be reconciled`,
    )
  }

  log?.({ resourceType, id }, '[Metriport bundle] Building resource entry')

  // Shallow clone, then drop the two fields Medplum must assign itself. Nested
  // objects are shared with the input, but nothing nested is modified — the
  // identifier list below is replaced rather than appended to in place.
  const stripped = { ...resource }
  delete stripped.id
  delete stripped.meta

  const localIdentity = fullUrl ?? `urn:uuid:${id}`

  if (RESOURCE_TYPES_WITHOUT_IDENTIFIER.includes(resourceType)) {
    return {
      fullUrl: localIdentity,
      resource: stripped,
      request: { method: 'POST', url: resourceType },
    }
  }

  const system = metriportIdentifierSystem(resourceType)
  const identifiable = stripped as { identifier?: Identifier[] | Identifier }
  const rawIdentifier = identifiable.identifier

  log?.(
    { resourceType, identifiers: rawIdentifier },
    '[Metriport bundle] Existing identifiers on resource',
  )

  if (!rawIdentifier || Array.isArray(rawIdentifier)) {
    const existing = rawIdentifier ?? []
    const alreadyStamped = existing.some(
      (identifier) => identifier.system === system && identifier.value === id,
    )

    identifiable.identifier = alreadyStamped
      ? existing
      : [...existing, { system, value: id }]
  }

  return {
    fullUrl: localIdentity,
    resource: stripped,
    request: {
      method: 'PUT',
      url: `${resourceType}?identifier=${system}|${id}`,
    },
  }
}
