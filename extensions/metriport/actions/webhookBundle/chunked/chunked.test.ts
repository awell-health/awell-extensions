import { chunked } from './chunked'

const asSource = async function* <T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) yield item
}

const collect = async <T>(source: AsyncIterable<T[]>): Promise<T[][]> => {
  const out: T[][] = []
  for await (const group of source) out.push(group)
  return out
}

const sized = (bytes: number, label: string): { bytes: number; label: string } => ({ bytes, label })
const labels = (groups: Array<Array<{ label: string }>>): string[][] =>
  groups.map((group) => group.map((item) => item.label))

describe('Metriport - chunked', () => {
  const limits = { maxEntries: 3, maxBytes: 100 }
  const sizeOf = (item: { bytes: number }): number => item.bytes

  test('Should keep every chunk to the maximum number of entries, in order', async () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((label) => sized(1, label))

    const groups = await collect(chunked(asSource(items), limits, sizeOf))

    expect(labels(groups)).toEqual([['a', 'b', 'c'], ['d', 'e', 'f'], ['g']])
  })

  test('Should keep every chunk to the maximum number of bytes', async () => {
    const items = [sized(40, 'a'), sized(40, 'b'), sized(40, 'c'), sized(10, 'd')]

    const groups = await collect(chunked(asSource(items), limits, sizeOf))

    expect(labels(groups)).toEqual([['a', 'b'], ['c', 'd']])
  })

  test('Should put an item that alone is over the byte maximum in a chunk of its own, whole', async () => {
    const items = [sized(10, 'a'), sized(500, 'huge'), sized(10, 'b'), sized(10, 'c')]

    const groups = await collect(chunked(asSource(items), limits, sizeOf))

    expect(labels(groups)).toEqual([['a'], ['huge'], ['b', 'c']])
  })

  test('Should fill a chunk exactly to a maximum without starting another early', async () => {
    const byCount = ['a', 'b', 'c'].map((label) => sized(1, label))
    const byBytes = [sized(50, 'a'), sized(50, 'b')]

    expect(labels(await collect(chunked(asSource(byCount), limits, sizeOf)))).toEqual([
      ['a', 'b', 'c'],
    ])
    expect(labels(await collect(chunked(asSource(byBytes), limits, sizeOf)))).toEqual([
      ['a', 'b'],
    ])
  })

  test('Should yield no chunk for no items, and never an empty one', async () => {
    expect(await collect(chunked(asSource([]), limits, sizeOf))).toEqual([])
  })

  test('Should be deterministic, so that a rerun makes the same chunks', async () => {
    const items = Array.from({ length: 20 }, (_, i) => sized((i * 37) % 60, `i${i}`))

    const first = await collect(chunked(asSource(items), limits, sizeOf))
    const second = await collect(chunked(asSource(items), limits, sizeOf))

    expect(labels(first)).toEqual(labels(second))
    expect(first.flat()).toHaveLength(20)
  })

  test('Should hold one chunk and one item at a time, not the source', async () => {
    let pulled = 0
    async function* counted(): AsyncGenerator<{ bytes: number; label: string }> {
      for (let i = 0; i < 1000; i++) {
        pulled++
        yield sized(1, `i${i}`)
      }
    }

    const iterator = chunked(counted(), limits, sizeOf)
    const first = await iterator.next()

    expect(first.value).toHaveLength(3)
    // The three in the chunk and the one that did not fit.
    expect(pulled).toBe(4)
  })

  describe('with items that hold several entries', () => {
    const group = (...labels: string[]): { bytes: number; labels: string[] } => ({ bytes: labels.length, labels })
    const groupSize = (item: { bytes: number }): number => item.bytes
    const entriesIn = (item: { labels: string[] }): number => item.labels.length

    test('Should count the entries in an item, not the item', async () => {
      const items = [group('a', 'b'), group('c', 'd'), group('e')]

      const groups = await collect(chunked(asSource(items), { maxEntries: 4, maxBytes: 100 }, groupSize, entriesIn))

      expect(groups.map((chunk) => chunk.flatMap((item) => item.labels))).toEqual([
        ['a', 'b', 'c', 'd'],
        ['e'],
      ])
    })

    test('Should never split an item, even one that alone has more entries than the maximum', async () => {
      const items = [group('a'), group('b', 'c', 'd', 'e', 'f'), group('g')]

      const groups = await collect(chunked(asSource(items), { maxEntries: 3, maxBytes: 100 }, groupSize, entriesIn))

      expect(groups.map((chunk) => chunk.flatMap((item) => item.labels))).toEqual([
        ['a'],
        ['b', 'c', 'd', 'e', 'f'],
        ['g'],
      ])
    })
  })
})
