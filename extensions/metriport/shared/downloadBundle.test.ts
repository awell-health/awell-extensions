import axios from 'axios'
import { Readable } from 'stream'
import { type ObjectStore } from '@awell-health/extensions-core'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  DOWNLOAD_BUNDLE_DEADLINE_MS,
  DOWNLOAD_BUNDLE_IDLE_TIMEOUT_MS,
  MAX_STORED_BUNDLE_BYTES,
  downloadBundle,
} from './downloadBundle'
import { retainedMemory } from './__testdata__/retainedMemory'

jest.mock('axios')
jest.mock('request-filtering-agent', () => ({
  useAgent: jest.fn(() => 'filtering-agent'),
}))

const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>

const URL_OF_BUNDLE = 'https://example.com/bundle?signature=secret'

const respondWith = ({
  body,
  headers = {},
}: {
  body: Readable
  headers?: Record<string, string>
}): void => {
  mockedGet.mockResolvedValue({ data: body, headers, status: 200 })
}

const readAll = async (stream: Readable): Promise<string> => {
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

describe('Metriport - downloadBundle', () => {
  const { helpers, clearMocks } = TestHelpers.fromAction({
    key: 'a',
    onEvent: jest.fn(),
  } as never)
  const objectStore = helpers.objectStore

  beforeEach(() => {
    mockedGet.mockReset()
    clearMocks()
  })

  test('Should stream the body into the object store, never holding it as a string', async () => {
    respondWith({
      body: Readable.from([Buffer.from('{"resourceType":'), Buffer.from('"Bundle"}')]),
      headers: { 'content-length': '25' },
    })

    const { ref, bytes } = await downloadBundle({
      url: URL_OF_BUNDLE,
      name: 'metriport/act-1/bundle.json',
      objectStore,
    })

    expect(bytes).toBe(25)
    expect(objectStore.put).not.toHaveBeenCalled()
    expect(objectStore.putStream).toHaveBeenCalledWith(
      'metriport/act-1/bundle.json',
      expect.any(Readable),
      { contentType: 'application/json' },
    )
    expect(await readAll(await objectStore.getStream(ref))).toBe(
      '{"resourceType":"Bundle"}',
    )
  })

  test('Should ask for a stream, through the filtering agent, with a deadline', async () => {
    respondWith({ body: Readable.from(['{}']) })

    await downloadBundle({ url: URL_OF_BUNDLE, name: 'a.json', objectStore })

    expect(mockedGet).toHaveBeenCalledWith(
      URL_OF_BUNDLE,
      expect.objectContaining({
        httpAgent: 'filtering-agent',
        httpsAgent: 'filtering-agent',
        responseType: 'stream',
        timeout: DOWNLOAD_BUNDLE_IDLE_TIMEOUT_MS,
        signal: expect.any(AbortSignal),
        // The size check needs the bytes the server counted, not a gzip of them.
        headers: expect.objectContaining({ 'Accept-Encoding': 'identity' }),
      }),
    )
    expect(DOWNLOAD_BUNDLE_DEADLINE_MS).toBeGreaterThan(DOWNLOAD_BUNDLE_IDLE_TIMEOUT_MS)
  })

  describe('the stored size against the Content-Length', () => {
    test('Should fail, not go on with a truncated file, when fewer bytes were stored than the source said', async () => {
      respondWith({
        body: Readable.from(['{"resourceType":"Bundle"']),
        headers: { 'content-length': '1000' },
      })

      await expect(
        downloadBundle({ url: URL_OF_BUNDLE, name: 'a.json', objectStore }),
      ).rejects.toThrow(/stored 24 bytes.*1000/)
    })

    test('Should not put the presigned URL, which is a credential, in the error', async () => {
      respondWith({
        body: Readable.from(['{}']),
        headers: { 'content-length': '1000' },
      })

      await expect(
        downloadBundle({ url: URL_OF_BUNDLE, name: 'a.json', objectStore }),
      ).rejects.not.toThrow(/signature|secret/)
    })

    test('Should accept a body when no Content-Length was sent', async () => {
      respondWith({ body: Readable.from(['{}']) })

      await expect(
        downloadBundle({ url: URL_OF_BUNDLE, name: 'a.json', objectStore }),
      ).resolves.toEqual(expect.objectContaining({ bytes: 2 }))
    })

    test('Should not compare when the body was content-encoded, as the length counts the encoded bytes', async () => {
      respondWith({
        body: Readable.from(['{}']),
        headers: { 'content-length': '1000', 'content-encoding': 'gzip' },
      })

      await expect(
        downloadBundle({ url: URL_OF_BUNDLE, name: 'a.json', objectStore }),
      ).resolves.toEqual(expect.objectContaining({ bytes: 2 }))
    })
  })

  test('Should store nothing, and say what failed, when the connection is cut mid-body', async () => {
    async function* cutOff(): AsyncGenerator<Buffer> {
      yield Buffer.from('{"resourceType":"Bund')
      throw new Error('aborted')
    }
    respondWith({
      body: Readable.from(cutOff(), { objectMode: false }),
      headers: { 'content-length': '1000' },
    })

    await expect(
      downloadBundle({ url: URL_OF_BUNDLE, name: 'metriport/act-cut/bundle.json', objectStore }),
    ).rejects.toThrow(/^aborted$/)

    await expect(objectStore.get('memory://metriport/act-cut/bundle.json')).rejects.toThrow()
  })

  describe('the size limit', () => {
    test('Should refuse a declared length over the limit without reading the body', async () => {
      const body = Readable.from(['{}'])
      respondWith({
        body,
        headers: { 'content-length': String(MAX_STORED_BUNDLE_BYTES + 1) },
      })

      await expect(
        downloadBundle({ url: URL_OF_BUNDLE, name: 'a.json', objectStore }),
      ).rejects.toThrow(/larger than/)

      expect(objectStore.putStream).not.toHaveBeenCalled()
      expect(body.destroyed).toBe(true)
    })

    test('Should stop a body that outgrows the limit when no length was declared', async () => {
      const piece = Buffer.alloc(1024 * 1024)
      async function* endless(): AsyncGenerator<Buffer> {
        for (let i = 0; i < MAX_STORED_BUNDLE_BYTES / piece.length + 10; i++) yield piece
      }
      const body = Readable.from(endless(), { objectMode: false })
      respondWith({ body })
      const discarding: ObjectStore = {
        ...objectStore,
        putStream: jest.fn(async (name, stream) => {
          let size = 0
          for await (const chunk of stream) size += chunk.length
          return { ref: `memory://${name}`, size }
        }),
      }

      await expect(
        downloadBundle({ url: URL_OF_BUNDLE, name: 'a.json', objectStore: discarding }),
      ).rejects.toThrow(/larger than/)
      expect(body.destroyed).toBe(true)
    }, 60000)
  })

  test('Should fail a body that stops sending, whatever the socket does about it, and store nothing', async () => {
    async function* stalls(): AsyncGenerator<Buffer> {
      yield Buffer.from('{"resourceType":')
      await new Promise(() => undefined)
    }
    respondWith({ body: Readable.from(stalls(), { objectMode: false }) })

    await expect(
      downloadBundle({
        url: URL_OF_BUNDLE,
        name: 'metriport/act-stall/bundle.json',
        objectStore,
        idleTimeoutMs: 50,
      }),
    ).rejects.toThrow(/stopped sending/)

    await expect(objectStore.get('memory://metriport/act-stall/bundle.json')).rejects.toThrow()
  })

  test('Should not mind a body that is slow but keeps sending', async () => {
    async function* slow(): AsyncGenerator<Buffer> {
      for (let i = 0; i < 6; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20))
        yield Buffer.from('xx')
      }
    }
    respondWith({ body: Readable.from(slow(), { objectMode: false }) })

    await expect(
      // Far longer than the gaps between pieces, so a busy machine does not make it a stall.
      downloadBundle({ url: URL_OF_BUNDLE, name: 'a.json', objectStore, idleTimeoutMs: 2000 }),
    ).resolves.toEqual(expect.objectContaining({ bytes: 12 }))
  })

  test('Should hold a bounded amount of memory however large the bundle is', async () => {
    // Just under the limit: the point is a body far larger than the memory held.
    const total = 240 * 1024 * 1024
    const piece = 64 * 1024
    const memory = retainedMemory()
    async function* generated(): AsyncGenerator<Buffer> {
      let count = 0
      for (let sent = 0; sent < total; sent += piece) {
        // A new buffer each time, so a download that collected them would show.
        yield Buffer.alloc(piece, 'x')
        // Measured here, while the download is under way: a timer would never
        // run, as a stream between memory and memory never leaves the microtask
        // queue. The turn of the event loop is what a real socket gives.
        if (++count % 128 === 0) {
          memory.sample()
          await new Promise((resolve) => setImmediate(resolve))
        }
      }
    }
    respondWith({
      body: Readable.from(generated(), { objectMode: false }),
      headers: { 'content-length': String(total) },
    })
    const discarding: ObjectStore = {
      ...objectStore,
      putStream: jest.fn(async (name, stream) => {
        let size = 0
        for await (const chunk of stream) size += chunk.length
        return { ref: `memory://${name}`, size }
      }),
    }

    const { bytes } = await downloadBundle({
      url: URL_OF_BUNDLE,
      name: 'big.json',
      objectStore: discarding,
    })

    expect(bytes).toBe(total)
    // Buffering the body would take at least `total`.
    expect(memory.growth()).toBeLessThan(total / 4)
  }, 120000)
})
