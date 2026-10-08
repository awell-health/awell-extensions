import { Readable } from 'stream'
import { TestHelpers, type ObjectStore } from '@awell-health/extensions-core'
import { type BundleEntry } from '@medplum/fhirtypes'
import { readBundleEntries, type BundleHeader } from './readBundle'

const newStore = (): ObjectStore => TestHelpers.mockHelpers().objectStore

/** A store that hands the body back a few bytes at a time, as a socket does. */
const inPieces = (store: ObjectStore, size: number): ObjectStore => ({
  ...store,
  getStream: async (ref) => {
    const bytes = Buffer.from(await store.get(ref), 'utf8')
    const pieces: Buffer[] = []
    for (let at = 0; at < bytes.length; at += size) pieces.push(bytes.subarray(at, at + size))
    return Readable.from(pieces)
  },
})

const collect = async (
  store: ObjectStore,
  ref: string,
  header?: BundleHeader,
): Promise<Array<{ entry: BundleEntry; index: number }>> => {
  const out: Array<{ entry: BundleEntry; index: number }> = []
  for await (const item of readBundleEntries(store, ref, header)) out.push(item)
  return out
}

describe('Metriport - readBundleEntries', () => {
  test('Should yield each entry with its position, in order', async () => {
    const store = newStore()
    const ref = await store.put(
      'a.json',
      JSON.stringify({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          { fullUrl: 'urn:uuid:1', resource: { resourceType: 'Encounter', id: '1' } },
          { fullUrl: 'urn:uuid:2', resource: { resourceType: 'Condition', id: '2' } },
        ],
      }),
    )

    const entries = await collect(store, ref)

    expect(entries.map(({ entry, index }) => [index, entry.resource?.id])).toEqual([
      [0, '1'],
      [1, '2'],
    ])
    expect(entries[0].entry.fullUrl).toBe('urn:uuid:1')
  })

  test('Should read the bundle across any chunk boundary, inside a multi-byte character too', async () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      id: 'b-1',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'p',
            name: [{ family: 'José "the \\ quoted" ✓ 日本' }],
          },
        },
      ],
    }
    const store = newStore()
    const ref = await store.put('a.json', JSON.stringify(bundle))

    for (const size of [1, 2, 3, 7, 64]) {
      const entries = await collect(inPieces(store, size), ref)
      expect(entries.map((e) => e.entry)).toEqual(bundle.entry)
    }
  })

  test('Should fill the header from the top-level fields, wherever they are in the document', async () => {
    const store = newStore()
    const before = await store.put(
      'before.json',
      '{"resourceType":"Bundle","id":"b-1","type":"collection","timestamp":"2026-10-01T10:00:00Z","entry":[{"resource":{"resourceType":"Patient","id":"p"}}]}',
    )
    const after = await store.put(
      'after.json',
      '{"entry":[{"resource":{"resourceType":"Patient","id":"p"}}],"resourceType":"Bundle","id":"b-2","type":"collection","timestamp":"2026-10-02T10:00:00Z"}',
    )

    const first: BundleHeader = {}
    const second: BundleHeader = {}
    await collect(store, before, first)
    await collect(store, after, second)

    expect(first).toEqual({ id: 'b-1', type: 'collection', timestamp: '2026-10-01T10:00:00Z' })
    expect(second).toEqual({ id: 'b-2', type: 'collection', timestamp: '2026-10-02T10:00:00Z' })
  })

  test('Should take only the top-level entry, not an entry inside a resource', async () => {
    const store = newStore()
    const ref = await store.put(
      'a.json',
      JSON.stringify({
        resourceType: 'Bundle',
        type: 'document',
        entry: [
          {
            resource: {
              resourceType: 'Composition',
              id: 'c',
              // A section's `entry` is a list of references, and must not be read as the bundle's.
              section: [{ entry: [{ reference: 'Condition/2' }] }],
            },
          },
        ],
      }),
    )

    const entries = await collect(store, ref)

    expect(entries).toHaveLength(1)
    expect(entries[0].entry.resource?.resourceType).toBe('Composition')
  })

  test('Should yield nothing, and still read the header, for a bundle with no entries', async () => {
    const store = newStore()
    const ref = await store.put('a.json', '{"resourceType":"Bundle","type":"searchset","id":"empty"}')
    const header: BundleHeader = {}

    expect(await collect(store, ref, header)).toEqual([])
    expect(header).toEqual({ id: 'empty', type: 'searchset' })
  })

  test('Should fail, not end quietly, when the stored bundle is cut off', async () => {
    const store = newStore()
    const whole = JSON.stringify({
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        { resource: { resourceType: 'Encounter', id: '1' } },
        { resource: { resourceType: 'Condition', id: '2' } },
      ],
    })
    const ref = await store.put('cut.json', whole.slice(0, whole.length - 30))

    await expect(collect(store, ref)).rejects.toThrow()
  })

  test('Should fail for content that is not JSON, without quoting it', async () => {
    const store = newStore()
    const ref = await store.put('a.json', '<html>patient John Doe, MRN 12345</html>')

    const failure = await collect(store, ref).catch((err: Error) => err)

    expect(failure).toBeInstanceOf(Error)
    expect((failure as Error).message).not.toMatch(/John Doe|12345/)
  })

  test('Should close the stored object when the reader stops early', async () => {
    const store = newStore()
    const ref = await store.put(
      'a.json',
      JSON.stringify({
        resourceType: 'Bundle',
        entry: Array.from({ length: 50 }, (_, i) => ({
          resource: { resourceType: 'Condition', id: String(i) },
        })),
      }),
    )
    let opened: Readable | undefined
    const watching: ObjectStore = {
      ...store,
      getStream: async (r) => {
        opened = await store.getStream(r)
        return opened
      },
    }

    for await (const { index } of readBundleEntries(watching, ref)) {
      if (index === 2) break
    }
    await new Promise((resolve) => setImmediate(resolve))

    expect(opened?.destroyed).toBe(true)
  })

  test('Should reject for a reference with nothing behind it', async () => {
    await expect(collect(newStore(), 'memory://nothing.json')).rejects.toThrow('nothing.json')
  })
})
