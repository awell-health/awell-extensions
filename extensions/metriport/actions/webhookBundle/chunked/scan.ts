import { type ObjectStore } from '@awell-health/extensions-core'
import { RESOURCE_TYPES_WITHOUT_IDENTIFIER } from '../bundle/constants'
import { orderByDependency } from './order'
import { detach, readBundleEntries, type BundleHeader } from './readBundle'

/**
 * What the scan will take on. They bound what is held, and how many times the
 * stored bundle is read afterwards: a bundle that is small in bytes can be a very
 * large number of tiny resources, or one chain of references a thousand deep, and
 * the import runs in a process that other tenants' jobs share.
 */
export interface ScanLimits {
  /** Resources in the bundle. What is held is a few short strings for each. */
  maxResources: number
  /** Levels of references. Each is another read of the whole stored bundle. */
  maxDepth: number
  /** Resources in one group of resources that refer to each other, which is held whole, and sent in one transaction. */
  maxRecordResources: number
}

export const MAX_BUNDLE_RESOURCES = 300_000
export const MAX_DEPENDENCY_DEPTH = 64
export const MAX_RECORD_RESOURCES = 5_000

/**
 * What a FHIR id and a resource type are allowed to be. They are put in the
 * searches that write and find a resource, where a `,` or a `|` or a `&` would
 * change what is searched for and so what is replaced.
 */
const FHIR_ID = /^[A-Za-z0-9\-.]{1,64}$/
const RESOURCE_TYPE = /^[A-Z][A-Za-z]{0,63}$/

export const isFhirId = (text: string): boolean => FHIR_ID.test(text)

export interface BundleScan {
  header: BundleHeader
  /** The entries that carry a resource. */
  entryCount: number
  hasPatient: boolean
  hasEncounter: boolean
  hasComposition: boolean
  /** The id of the first Encounter, as Metriport has it. */
  encounterId: string | undefined
  /** The type of the first resource other than a Patient with no id: it cannot be reconciled. */
  firstWithoutId: string | undefined
  /** The position of the first resource other than a Patient whose id or type is not valid FHIR. */
  firstInvalid: number | undefined
  /**
   * Each resource a reference can mean, by every form a reference to it takes in
   * the bundle (`Type/id`, `urn:uuid:id` and its `fullUrl`), mapped to its key
   * `Type/id`. A reference not in here points outside the bundle.
   */
  keyOf: ReadonlyMap<string, string>
  /**
   * The rank of each resource other than the Patient, which is never written:
   * the order to write them in, so that what a resource refers to is written
   * before it. See `orderByDependency`.
   */
  ranks: ReadonlyMap<string, number>
  /**
   * The resources that refer to each other, in a cycle, by the id of their
   * group. A group is written in one transaction, never split between chunks.
   */
  groupOf: ReadonlyMap<string, number>
}

/**
 * One copy of each string that is kept. The same few resources are referred to
 * by thousands of others, so the strings kept are as many as the resources, not
 * as many as the references.
 */
const internPool = (): ((text: string) => string) => {
  const pool = new Map<string, string>()
  return (text) => {
    const known = pool.get(text)
    if (known !== undefined) return known
    const copy = detach(text)
    pool.set(copy, copy)
    return copy
  }
}

/**
 * Every `reference` in a resource that could point at another resource of the
 * bundle: not a conditional reference, and not one to the Patient, which the
 * import never writes and so is no part of an order.
 */
const referencesOf = (
  value: unknown,
  intern: (text: string) => string,
  found: Set<string> = new Set(),
): Set<string> => {
  if (Array.isArray(value)) {
    for (const item of value) referencesOf(item, intern, found)
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'reference' && typeof child === 'string') {
        if (!child.startsWith('Patient/') && !child.includes('?')) found.add(intern(child))
      } else {
        referencesOf(child, intern, found)
      }
    }
  }
  return found
}

/**
 * Reads a stored bundle once, entry by entry, for what can only be known about
 * the whole of it: what it is and holds, how its references resolve, and the
 * order its resources have to be written in, and which have to be written together. Nothing of an entry is kept but a
 * few short strings, so what is held grows with the number of resources, a small
 * fraction of the size of the bundle, and not with the size.
 */
export const scanBundle = async (
  store: Pick<ObjectStore, 'getStream'>,
  ref: string,
  limits: Partial<ScanLimits> = {},
): Promise<BundleScan> => {
  const {
    maxResources = MAX_BUNDLE_RESOURCES,
    maxDepth = MAX_DEPENDENCY_DEPTH,
    maxRecordResources = MAX_RECORD_RESOURCES,
  } = limits
  const header: BundleHeader = {}
  const intern = internPool()
  const keyOf = new Map<string, string>()
  const references = new Map<string, Set<string>>()
  let entryCount = 0
  let hasPatient = false
  let hasEncounter = false
  let hasComposition = false
  let encounterId: string | undefined
  let firstWithoutId: string | undefined
  let firstInvalid: number | undefined

  for await (const { entry, index: position } of readBundleEntries(store, ref, header)) {
    const resource = entry.resource
    if (resource === undefined) continue
    entryCount++
    // Stops the read: leaving the loop closes the stored bundle.
    if (entryCount > maxResources) {
      throw new Error(`[Metriport bundle] The bundle has more than ${maxResources} resources`)
    }

    const { resourceType, id } = resource
    if (resourceType === 'Patient') hasPatient = true
    if (resourceType === 'Composition') hasComposition = true
    if (resourceType === 'Encounter') {
      if (!hasEncounter) encounterId = id === undefined ? undefined : detach(id)
      hasEncounter = true
    }

    if (id === undefined) {
      if (resourceType !== 'Patient') firstWithoutId ??= resourceType
      continue
    }

    if (
      resourceType !== 'Patient' &&
      (!isFhirId(id) || !RESOURCE_TYPE.test(resourceType))
    ) {
      firstInvalid ??= position
    }

    const key = intern(`${resourceType}/${id}`)
    for (const form of [key, `urn:uuid:${id}`, entry.fullUrl]) {
      if (form !== undefined && !keyOf.has(form)) keyOf.set(intern(form), key)
    }
    if (resourceType !== 'Patient') references.set(key, referencesOf(resource, intern))
  }

  // A reference can come before what it points at, so they are resolved once
  // every resource has been seen.
  const dependencies = new Map<string, string[]>()
  for (const [key, forms] of references) {
    const targets = new Set<string>()
    for (const form of forms) {
      const target = keyOf.get(form)
      if (target !== undefined && target !== key && !target.startsWith('Patient/')) {
        targets.add(target)
      }
    }
    dependencies.set(key, [...targets])
  }
  // A resource with no `identifier` element cannot be the target of a conditional
  // reference from another chunk. What refers to it is written with it, which is
  // what a cycle is, so the reference is made to run both ways.
  const withoutIdentifier = (key: string): boolean =>
    RESOURCE_TYPES_WITHOUT_IDENTIFIER.includes(key.slice(0, key.indexOf('/')))
  const reverse: Array<[string, string]> = []
  for (const [key, targets] of dependencies) {
    for (const target of targets) if (withoutIdentifier(target)) reverse.push([target, key])
  }
  for (const [target, key] of reverse) {
    const targets = dependencies.get(target) as string[]
    if (!targets.includes(key)) targets.push(key)
  }

  const { ranks, groups: groupOf } = orderByDependency(dependencies)

  // Not `Math.max(...ranks.values())`: a spread of that many arguments overflows the stack.
  for (const rank of ranks.values()) {
    if (rank > maxDepth) {
      throw new Error(
        `[Metriport bundle] The references between the resources are nested more than ${maxDepth} levels deep`,
      )
    }
  }
  const groupSizes = new Map<number, number>()
  for (const group of groupOf.values()) {
    const size = (groupSizes.get(group) ?? 0) + 1
    if (size > maxRecordResources) {
      throw new Error(
        `[Metriport bundle] Resources that refer to each other are more than ${maxRecordResources} in one group`,
      )
    }
    groupSizes.set(group, size)
  }

  return {
    header,
    entryCount,
    hasPatient,
    hasEncounter,
    hasComposition,
    encounterId,
    firstWithoutId,
    firstInvalid,
    keyOf,
    ranks,
    groupOf,
  }
}
