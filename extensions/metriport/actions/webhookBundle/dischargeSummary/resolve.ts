import { type Bundle, type Reference, type Resource } from '@medplum/fhirtypes'

/** Every way a resource in the bundle can be referred to, mapped to the resource. */
export type ResourceIndex = Map<string, Resource>

/**
 * Metriport emits `urn:uuid:<id>` fullUrls but `<Type>/<id>` references, and
 * occasionally `urn:uuid:` references too, so every entry is indexed under all
 * three forms. Resolution is then a plain lookup, whichever form a reference
 * takes.
 */
export const indexBundle = (bundle: Bundle): ResourceIndex => {
  const index: ResourceIndex = new Map()

  for (const entry of bundle.entry ?? []) {
    const resource = entry.resource
    if (resource === undefined) continue

    if (entry.fullUrl !== undefined) index.set(entry.fullUrl, resource)
    if (resource.id !== undefined) {
      index.set(`${resource.resourceType}/${resource.id}`, resource)
      index.set(`urn:uuid:${resource.id}`, resource)
    }
  }

  return index
}

/**
 * The resource a reference points at, if it is in the bundle and of the
 * expected type. A reference to something outside the bundle, or to a
 * resource of another type, resolves to nothing rather than to a surprise.
 */
export const resolve = <T extends Resource>(
  index: ResourceIndex,
  reference: Reference | undefined,
  resourceType: T['resourceType'],
): T | undefined => {
  const target = reference?.reference
  if (target === undefined) return undefined

  const resource = index.get(target)
  return resource?.resourceType === resourceType ? (resource as T) : undefined
}

/**
 * Resolves a list of references to the resources of one type among them, in
 * order, each resource at most once. Sections and `Procedure.report` both mix
 * types (a Practitioner next to the CarePlan, say), so filtering by type is
 * the normal case rather than the exception.
 */
export const resolveAll = <T extends Resource>(
  index: ResourceIndex,
  references: Reference[] | undefined,
  resourceType: T['resourceType'],
): T[] => {
  const seen = new Set<T>()
  for (const reference of references ?? []) {
    const resource = resolve<T>(index, reference, resourceType)
    if (resource !== undefined) seen.add(resource)
  }
  return [...seen]
}

/** Every resource of one type in the bundle, in bundle order. */
export const resourcesOfType = <T extends Resource>(
  bundle: Bundle,
  resourceType: T['resourceType'],
): T[] =>
  (bundle.entry ?? [])
    .map((entry) => entry.resource)
    .filter(
      (resource): resource is T => resource?.resourceType === resourceType,
    )
