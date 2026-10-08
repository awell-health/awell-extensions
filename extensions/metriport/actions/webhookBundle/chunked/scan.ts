import { type ObjectStore } from '@awell-health/extensions-core'
import { orderByDependency } from './order'
import { readBundleEntries, type BundleHeader } from './readBundle'

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
  /** The highest rank, or -1 when there is nothing to write. */
  maxRank: number
}

/**
 * A copy of a string that holds nothing but itself. A string the parser hands
 * back is a slice of the chunk it was read from, and a slice keeps the whole
 * chunk alive: every string kept for the length of the scan would keep a chunk
 * of the bundle, and together they would keep the bundle.
 */
const detach = (text: string): string => Buffer.from(text, 'utf8').toString('utf8')

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
): Promise<BundleScan> => {
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

  for await (const { entry } of readBundleEntries(store, ref, header)) {
    const resource = entry.resource
    if (resource === undefined) continue
    entryCount++

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
  const { ranks, groups: groupOf } = orderByDependency(dependencies)
  // Not `Math.max(...ranks.values())`: a spread of that many arguments overflows the stack.
  let maxRank = -1
  for (const rank of ranks.values()) if (rank > maxRank) maxRank = rank

  return {
    header,
    entryCount,
    hasPatient,
    hasEncounter,
    hasComposition,
    encounterId,
    firstWithoutId,
    keyOf,
    ranks,
    groupOf,
    maxRank,
  }
}
