import { Transform, pipeline } from 'stream'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/Pick'
import { streamArray } from 'stream-json/streamers/StreamArray'
import { type BundleEntry } from '@medplum/fhirtypes'
import { type ObjectStore } from '@awell-health/extensions-core'

/**
 * A copy of a string that holds nothing but itself. A string the parser hands
 * back is a slice of the chunk it was read from, and a slice keeps the whole
 * chunk alive: every string kept for the length of a read would keep a chunk of
 * the bundle, and together they would keep the bundle.
 */
export const detach = (text: string): string => Buffer.from(text, 'utf8').toString('utf8')

/** The top-level fields of a bundle that the import needs besides its entries. */
export interface BundleHeader {
  id?: string
  type?: string
  timestamp?: string
}

const HEADER_FIELDS: ReadonlySet<string> = new Set<keyof BundleHeader>([
  'id',
  'type',
  'timestamp',
])

interface Token {
  name: string
  value?: unknown
}

/**
 * Notes the bundle's own `id`, `type` and `timestamp` as the tokens go by,
 * passing every token on untouched. They can come before or after the entries,
 * and the entries are far too many to wait for them, so they are read in the
 * same pass.
 */
const noteHeader = (header: BundleHeader): Transform => {
  let depth = 0
  let key: string | undefined
  return new Transform({
    objectMode: true,
    transform: (token: Token, _encoding, callback) => {
      switch (token.name) {
        case 'startObject':
        case 'startArray':
          depth++
          break
        case 'endObject':
        case 'endArray':
          depth--
          break
        case 'keyValue':
          key = depth === 1 ? String(token.value) : undefined
          break
        case 'stringValue':
          if (depth === 1 && key !== undefined && HEADER_FIELDS.has(key)) {
            header[key as keyof BundleHeader] = detach(String(token.value))
          }
          key = undefined
          break
        case 'numberValue':
        case 'trueValue':
        case 'falseValue':
        case 'nullValue':
          key = undefined
          break
      }
      callback(null, token)
    },
  })
}

/**
 * Reads the entries of a stored bundle one at a time, so that what is held is
 * one entry and not the bundle: a bundle can reach 100 MB, and parsing it in one
 * go holds several times that.
 *
 * `header` is filled with the bundle's own `id`, `type` and `timestamp`, and is
 * complete once the last entry has been read.
 *
 * Fails when the bundle is cut off or is not JSON, never ends quietly with the
 * entries it did get: a truncated bundle must not be imported as a whole one.
 * The message says that, and nothing of the content, which is PHI.
 */
export async function* readBundleEntries(
  store: Pick<ObjectStore, 'getStream'>,
  ref: string,
  header: BundleHeader = {},
): AsyncGenerator<{ entry: BundleEntry; index: number }> {
  const source = await store.getStream(ref)
  const tokens = parser()
  const entries = streamArray()

  // Whichever stream fails first is where the failure came from: `pipeline`
  // then destroys the others with that same error.
  let failedIn: 'source' | 'parser' | undefined
  source.once('error', () => {
    failedIn ??= 'source'
  })
  tokens.once('error', () => {
    failedIn ??= 'parser'
  })

  pipeline(
    source,
    tokens,
    noteHeader(header),
    pick({ filter: 'entry' }),
    entries,
    () => undefined,
  )

  try {
    for await (const { key, value } of entries) {
      yield { entry: value as BundleEntry, index: key }
    }
  } catch (err) {
    if (failedIn === 'parser') {
      throw new Error('The stored bundle is not valid JSON, or is cut off')
    }
    throw err
  }
}
