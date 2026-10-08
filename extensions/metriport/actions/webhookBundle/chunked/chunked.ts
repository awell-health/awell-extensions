export interface ChunkLimits {
  /** The most items in a chunk. */
  maxEntries: number
  /** The most bytes in a chunk, counted with `sizeOf`. */
  maxBytes: number
}

/**
 * Groups the items of a source into chunks that stay within the limits, in
 * order, holding one chunk and the item that did not fit at a time.
 *
 * An item is never split, and is the unit a chunk is filled with: it can be one
 * entry, or a group of entries that have to be sent together, in which case
 * `countOf` says how many entries it holds. One that is over a limit on its own
 * gets a chunk to itself, as the one case where a chunk is over the limit. The
 * same items in the same order always make the same chunks, which is what lets a
 * rerun write the same bundles and so the same resources.
 */
export async function* chunked<T>(
  source: AsyncIterable<T>,
  { maxEntries, maxBytes }: ChunkLimits,
  sizeOf: (item: T) => number,
  countOf: (item: T) => number = () => 1,
): AsyncGenerator<T[]> {
  let chunk: T[] = []
  let bytes = 0
  let entries = 0

  for await (const item of source) {
    const size = sizeOf(item)
    const count = countOf(item)
    if (chunk.length > 0 && (entries + count > maxEntries || bytes + size > maxBytes)) {
      yield chunk
      chunk = []
      bytes = 0
      entries = 0
    }
    chunk.push(item)
    bytes += size
    entries += count
  }

  if (chunk.length > 0) yield chunk
}
