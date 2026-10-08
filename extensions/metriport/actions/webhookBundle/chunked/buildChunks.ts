import { createHash } from 'crypto'
import { type BundleEntry, type Resource } from '@medplum/fhirtypes'
import { type ObjectStore } from '@awell-health/extensions-core'
import { buildAccountOrganizationEntry } from '../bundle/account'
import {
  METRIPORT_IMPORT_CHUNK_SYSTEM,
  RESOURCE_TYPES_WITHOUT_IDENTIFIER,
  awellPatientReference,
  metriportIdentifierSystem,
} from '../bundle/constants'
import { buildResourceEntry } from '../bundle/entries'
import { buildProvenance } from '../bundle/provenance'
import { rewriteReferences } from '../bundle/references'
import { chunked, type ChunkLimits } from './chunked'
import {
  TRANSACTION_CHUNKS_KIND,
  type TransactionChunk,
  type TransactionChunksManifest,
} from './manifest'
import { readBundleEntries } from './readBundle'
import { isFhirId, type BundleScan } from './scan'

/**
 * How big a transaction is sent to Medplum. A transaction is all or nothing in
 * one database transaction and one request body, so a bundle of a hundred
 * megabytes cannot go as one: it is over what a request may hold and would hold
 * a lock for as long as it takes. These are comfortably inside both.
 */
export const DEFAULT_CHUNK_LIMITS: ChunkLimits = {
  maxEntries: 200,
  maxBytes: 4 * 1024 * 1024,
}

/**
 * A piece of text for a search: itself when it is a valid FHIR id, else a digest
 * of it, as the bundle's own id is whatever the source sent and a `,` or a `|` or
 * a `&` in it would change what is searched for.
 */
const keyPart = (text: string): string =>
  isFhirId(text)
    ? text
    : createHash('sha256').update(text).digest('hex').slice(0, 32)

interface SourceEntry {
  entry: BundleEntry & { resource: Resource }
  /** Its position in the source bundle. */
  index: number
  /** `Type/id`. */
  key: string
  /** The size it is counted as when filling a chunk. */
  bytes: number
}

/**
 * A reference to a resource a chunk before this one wrote, by the identifier it
 * was written with. A resource type that has no identifier element has none, but
 * nothing refers to one from another chunk: what refers to it is written with it.
 */
const conditionalReference = (key: string): string | undefined => {
  const slash = key.indexOf('/')
  const resourceType = key.slice(0, slash)
  if (RESOURCE_TYPES_WITHOUT_IDENTIFIER.includes(resourceType)) return undefined
  return `${resourceType}?identifier=${metriportIdentifierSystem(resourceType)}|${key.slice(slash + 1)}`
}

/**
 * Cuts a stored Metriport Patient Encounter Bundle into transaction bundles that
 * can each be sent to Medplum on their own, writes each as its own object, and
 * returns the manifest that lists them in the order to execute them.
 *
 * It does what `buildTransactionBundle` does for the one transaction, but a
 * chunk at a time, reading the stored bundle entry by entry so that what is held
 * is one chunk and not the bundle:
 *
 * - **Order.** A `urn:uuid` reference only resolves inside its own bundle, so a
 *   reference to a resource in another chunk is a conditional one, and that only
 *   resolves to something already written. Resources are therefore written in
 *   rank order (see `scan`): everything a resource refers to is in an earlier
 *   chunk, or in its own, where the reference stays the entry's `fullUrl`.
 * - **Records.** Resources that refer to each other, such as an Encounter and
 *   its diagnoses, cannot be ordered, so they are one record: written in one
 *   chunk, never split, however small the limit, where the references between
 *   them resolve. They are held together in memory until the pass that writes
 *   them ends, which is a few resources, not the bundle. A resource type with no
 *   `identifier` element is in the record of every resource that refers to it, as
 *   it cannot be referred to conditionally from another chunk.
 * - **Rerun.** Every entry is a conditional update on what identifies it, or a
 *   conditional create, so sending a chunk again, or all of them again after a
 *   failure part way, replaces what is there and adds nothing. The chunks are the
 *   same bytes every time for the same source, so a rerun replaces the same
 *   resources. The one exception is a resource type that has no `identifier`
 *   element, which is written with a POST and written again; Medplum reserves
 *   `meta`, so it cannot be tagged to be found by.
 * - **Provenance.** One per chunk, for the resources of that chunk: a single one
 *   for a whole bundle would be a resource of its own size. Each is a conditional
 *   update on a key of the source bundle and the chunk, so a rerun replaces it.
 *
 * A record that is larger than the limits is written whole, in a chunk of its
 * own.
 */
export const buildTransactionChunks = async ({
  store,
  sourceRef,
  scan,
  namePrefix,
  awellPatientId,
  eventType,
  reason,
  now,
  limits = DEFAULT_CHUNK_LIMITS,
}: {
  store: Pick<ObjectStore, 'getStream' | 'put'>
  sourceRef: string
  scan: BundleScan
  /** Object names are `<namePrefix>/00001.json` and so on, and `<namePrefix>/manifest.json`. */
  namePrefix: string
  awellPatientId: string
  eventType?: string
  reason?: string
  /** Fallback for `Provenance.recorded`; injectable so tests stay deterministic. */
  now?: string
  limits?: ChunkLimits
}): Promise<{ manifestRef: string; manifest: TransactionChunksManifest }> => {
  const missing = [
    ...(scan.hasPatient ? [] : ['Patient']),
    ...(scan.hasEncounter ? [] : ['Encounter']),
  ]
  if (missing.length > 0) {
    throw new Error(
      `[Metriport bundle] Collection bundle has no ${missing.join(
        ' or ',
      )} entry, so it is not a valid Patient Encounter Bundle`,
    )
  }
  if (scan.firstWithoutId !== undefined) {
    throw new Error(
      `[Metriport bundle] ${scan.firstWithoutId} entry is missing an id, so it cannot be reconciled`,
    )
  }
  // Not quoted: it is what a hostile bundle would say, and it is put in searches.
  if (scan.firstInvalid !== undefined) {
    throw new Error(
      `[Metriport bundle] Entry ${scan.firstInvalid} has an id or resource type that is not valid FHIR`,
    )
  }

  const sourceBundleId = scan.header.id
  const recorded = scan.header.timestamp ?? now ?? new Date().toISOString()
  const ranks = [...new Set(scan.ranks.values())].sort((a, b) => a - b)

  /**
   * The records of one rank, one read of the stored bundle. A resource that is
   * on its own is a record as it comes, in source order. The resources of a
   * cycle are held until the read ends, then given a record each, in the order
   * their first resource came in.
   */
  async function* recordsOfRank(rank: number): AsyncGenerator<SourceEntry[]> {
    const cycles = new Map<number, SourceEntry[]>()
    for await (const { entry, index } of readBundleEntries(store, sourceRef)) {
      const resource = entry.resource
      if (resource === undefined || resource.resourceType === 'Patient') continue
      const key = `${resource.resourceType}/${resource.id as string}`
      if (scan.ranks.get(key) !== rank) continue

      const item: SourceEntry = {
        entry: entry as SourceEntry['entry'],
        index,
        key,
        bytes: JSON.stringify(resource).length,
      }
      const group = scan.groupOf.get(key)
      if (group === undefined) {
        yield [item]
      } else {
        const members = cycles.get(group)
        if (members === undefined) cycles.set(group, [item])
        else members.push(item)
      }
    }
    yield* cycles.values()
  }

  const writeChunk = async (
    records: SourceEntry[][],
    number: number,
    rank: number,
  ): Promise<TransactionChunk> => {
    const group = records.flat()
    // Not `Math.min(...)`: a record can be as large as the bundle, and a spread of that many arguments overflows the stack.
    let first = Infinity
    let last = -Infinity
    for (const { index } of group) {
      if (index < first) first = index
      if (index > last) last = index
    }
    const inChunk = new Map<string, string>()
    for (const { entry, key } of group) {
      inChunk.set(key, entry.fullUrl ?? `urn:uuid:${entry.resource.id as string}`)
    }

    const resolve = (reference: string): string | undefined => {
      const target = scan.keyOf.get(reference)
      if (target === undefined) return undefined
      if (target.startsWith('Patient/')) return awellPatientReference(awellPatientId)
      return inChunk.get(target) ?? conditionalReference(target)
    }

    const resourceEntries = group.map(({ entry }) =>
      buildResourceEntry(rewriteReferences(entry.resource, resolve), entry.fullUrl),
    )

    const provenance = buildProvenance({
      targetReferences: resourceEntries
        .map((entry) => entry.fullUrl)
        .filter((fullUrl): fullUrl is string => fullUrl !== undefined),
      sourceBundleId,
      recorded,
      reason,
      eventType,
      idempotencyKey: {
        system: METRIPORT_IMPORT_CHUNK_SYSTEM,
        code: `${keyPart(sourceBundleId ?? sourceRef)}:${number}`,
      },
    })

    const body = JSON.stringify({
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [buildAccountOrganizationEntry(), ...resourceEntries, provenance],
    })
    const ref = await store.put(
      `${namePrefix}/${String(number).padStart(5, '0')}.json`,
      body,
    )

    return {
      ref,
      entries: group.length,
      rank,
      firstSourceEntry: first,
      lastSourceEntry: last,
      bytes: Buffer.byteLength(body),
    }
  }

  const chunks: TransactionChunk[] = []
  for (const rank of ranks) {
    const records = chunked(
      recordsOfRank(rank),
      limits,
      (record) => record.reduce((total, item) => total + item.bytes, 0),
      (record) => record.length,
    )
    for await (const chunk of records) {
      chunks.push(await writeChunk(chunk, chunks.length + 1, rank))
    }
  }

  const manifest: TransactionChunksManifest = {
    kind: TRANSACTION_CHUNKS_KIND,
    version: 1,
    ...(sourceBundleId !== undefined ? { sourceBundleId } : {}),
    sourceRef,
    totalEntries: chunks.reduce((total, chunk) => total + chunk.entries, 0),
    chunks,
  }
  const manifestRef = await store.put(`${namePrefix}/manifest.json`, JSON.stringify(manifest))

  return { manifestRef, manifest }
}
