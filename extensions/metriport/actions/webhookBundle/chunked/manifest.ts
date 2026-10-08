/**
 * What `Store Webhook Bundle` returns as `transactionBundleRef` for a bundle it
 * has split: a list of the transaction bundles to execute, in order. The Medplum
 * `Execute stored bundle` action reads this shape, which it defines for itself
 * rather than importing, as one extension does not depend on another.
 */
export const TRANSACTION_CHUNKS_KIND = 'transaction-chunks'

export interface TransactionChunk {
  /** Reference to the stored transaction bundle. */
  ref: string
  /** The resources in it, not counting the account Organization and the Provenance every chunk carries. */
  entries: number
  /** The rank it was written at: everything it refers to is in an earlier rank. */
  rank: number
  /** The positions, in the source bundle, of the first and last entry in it. */
  firstSourceEntry: number
  lastSourceEntry: number
  /** The size of the stored bundle, in bytes. */
  bytes: number
}

export interface TransactionChunksManifest {
  kind: typeof TRANSACTION_CHUNKS_KIND
  version: 1
  /** The id of the Metriport bundle, when it had one. */
  sourceBundleId?: string
  /** The reference of the stored source bundle the chunks were cut from. */
  sourceRef: string
  /** The resources across all chunks. */
  totalEntries: number
  /** In the order to execute them. */
  chunks: TransactionChunk[]
}
