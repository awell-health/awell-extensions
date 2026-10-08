import axios from 'axios'
import v8 from 'v8'
import vm from 'vm'
import { Readable } from 'stream'
import { generateTestPayload } from '@/tests'
import { TestHelpers, type ObjectStore } from '@awell-health/extensions-core'
import { MedplumClient } from '@medplum/core'
import { storeWebhookBundle } from './storeWebhookBundle'
import { executeStoredBundle } from '../../../medplum/actions/executeStoredBundle/executeStoredBundle'
import { DEFAULT_CHUNK_LIMITS, buildTransactionChunks } from '../webhookBundle/chunked/buildChunks'
import { scanBundle } from '../webhookBundle/chunked/scan'
import { fakeMedplum } from '../webhookBundle/chunked/__testdata__/fakeMedplum'

/**
 * A Metriport bundle too large to pass between care flow steps, taken through
 * the whole of the import: the download, storage, the split into transactions
 * and the Medplum action that executes them. Only the network and Medplum are
 * stood in for. The Medplum fake keeps what a transaction must: it is all or
 * nothing, and a conditional reference must find what an earlier one wrote.
 */
jest.mock('axios')
jest.mock('@medplum/core')
jest.mock('request-filtering-agent', () => ({ useAgent: jest.fn(() => 'agent') }))

const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>

const OBSERVATIONS = 6600
const PRACTITIONERS = 12
const NOTE = 'Narrative of the result. '.repeat(120)

/** The bundle as the pieces of JSON text a socket would deliver, made as they are asked for. */
const bundleText = function* ({ observations }: { observations: number }): Generator<string> {
  const entry = (resource: Record<string, unknown>): string =>
    JSON.stringify({ fullUrl: `urn:uuid:${resource.id as string}`, resource })

  yield '{"resourceType":"Bundle","type":"collection","id":"big-bundle","timestamp":"2026-10-01T10:00:00.000Z","entry":['
  // The Observations come first and what they point at last, as nothing says they cannot.
  for (let i = 0; i < observations; i++) {
    yield `${i === 0 ? '' : ','}${entry({
      resourceType: 'Observation',
      id: `obs-${i}`,
      status: 'final',
      code: { text: `Result ${i}` },
      valueString: NOTE,
      encounter: { reference: 'Encounter/enc-1' },
      performer: [{ reference: `Practitioner/prac-${i % PRACTITIONERS}` }],
      // A third of them are members of the one before.
      ...(i % 3 === 1 ? { derivedFrom: [{ reference: `Observation/obs-${i - 1}` }] } : {}),
    })}`
  }
  for (let i = 0; i < PRACTITIONERS; i++) {
    yield `,${entry({ resourceType: 'Practitioner', id: `prac-${i}`, name: [{ family: `Practitioner ${i}` }] })}`
  }
  // The Encounter lists its diagnoses, and each diagnosis points back at it.
  yield `,${entry({
    resourceType: 'Encounter',
    id: 'enc-1',
    status: 'finished',
    serviceProvider: { reference: 'Organization/org-1' },
    diagnosis: [0, 1, 2].map((n) => ({ condition: { reference: `Condition/cond-${n}` } })),
  })}`
  for (const n of [0, 1, 2]) {
    yield `,${entry({
      resourceType: 'Condition',
      id: `cond-${n}`,
      code: { text: `Diagnosis ${n}` },
      encounter: { reference: 'Encounter/enc-1' },
    })}`
  }
  yield `,${entry({ resourceType: 'Organization', id: 'org-1', name: 'Hospital' })}`
  yield `,${entry({ resourceType: 'Patient', id: 'pat-1', name: [{ family: 'Source' }] })}`
  yield ']}'
}

const serve = (pieces: Iterable<string>, length?: number): void => {
  mockedGet.mockImplementation(async () => ({
    data: Readable.from(Buffer.from([...pieces].join('')).length > 0 ? [...pieces] : []),
    headers: length === undefined ? {} : { 'content-length': String(length) },
    status: 200,
  }))
}

describe('Metriport to Medplum - a bundle too large for one transaction', () => {
  const store = TestHelpers.fromAction(storeWebhookBundle)
  const medplumHelpers = TestHelpers.fromAction(executeStoredBundle)
  const text = [...bundleText({ observations: OBSERVATIONS })].join('')
  const resourceCount = OBSERVATIONS + PRACTITIONERS + 1 + 3 + 1 // not the Patient

  let transactionBundleRef: string
  let bundleRef: string
  const medplum = fakeMedplum()

  const runStore = async (): Promise<void> => {
    await storeWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: { url: 'https://example.com/b', eventType: 'patient.admit', provenanceReason: undefined },
        settings: { apiKey: 'k', baseUrl: '', webhookKey: '', rateLimitDuration: '' },
      }),
      onComplete: store.onComplete,
      onError: store.onError,
      helpers: store.helpers,
      attempt: 1,
    })
  }

  const runMedplum = async (): Promise<void> => {
    medplumHelpers.clearMocks()
    await executeStoredBundle.onEvent!({
      payload: {
        fields: { bundleRef: transactionBundleRef },
        pathway: { id: 'pathway' },
        activity: { id: 'activity-2' },
        settings: { clientId: 'c', clientSecret: 's', baseUrl: '' },
      } as never,
      onComplete: medplumHelpers.onComplete,
      onError: medplumHelpers.onError,
      helpers: store.helpers,
      attempt: 1,
    })
  }

  beforeAll(async () => {
    medplum.withPatient()
    jest.mocked(MedplumClient).mockImplementation(
      () =>
        ({
          startClientLogin: jest.fn(),
          executeBatch: async (bundle: never) => await medplum.executeBatch(bundle),
        }) as unknown as MedplumClient,
    )
    serve([text], Buffer.byteLength(text))
    await runStore()
    ;({ bundleRef, transactionBundleRef } = store.onComplete.mock.calls[0][0].data_points)
  }, 120000)

  test('Should be larger than a care flow step can carry, and give back a small result', () => {
    expect(Buffer.byteLength(text)).toBeGreaterThan(20 * 1024 * 1024)
    expect(store.onError).not.toHaveBeenCalled()
    expect(JSON.stringify(store.onComplete.mock.calls[0][0]).length).toBeLessThan(1000)
  })

  test('Should keep the bundle in storage exactly as it was sent', async () => {
    const chunks: Buffer[] = []
    for await (const chunk of await store.helpers.objectStore.getStream(bundleRef)) {
      chunks.push(Buffer.from(chunk))
    }

    expect(Buffer.concat(chunks).toString()).toBe(text)
  })

  test('Should split it into transactions, none over the entry limit except a record that is larger on its own', async () => {
    const manifest = JSON.parse(await store.helpers.objectStore.get(transactionBundleRef))

    expect(manifest.chunks.length).toBeGreaterThan(resourceCount / DEFAULT_CHUNK_LIMITS.maxEntries)
    expect(manifest.totalEntries).toBe(resourceCount)
    for (const chunk of manifest.chunks) {
      expect(chunk.entries).toBeLessThanOrEqual(DEFAULT_CHUNK_LIMITS.maxEntries)
      expect(chunk.bytes).toBeLessThanOrEqual(DEFAULT_CHUNK_LIMITS.maxBytes * 1.1)
    }
  })

  test('Should keep the Encounter and its diagnoses in one transaction', async () => {
    const manifest = JSON.parse(await store.helpers.objectStore.get(transactionBundleRef))
    const holding: string[][] = []
    for (const chunk of manifest.chunks) {
      const body = JSON.parse(await store.helpers.objectStore.get(chunk.ref))
      const types = body.entry.map((e: { resource: { resourceType: string; id?: string } }) => e.resource.resourceType)
      if (types.includes('Encounter') || types.includes('Condition')) holding.push(types)
    }

    expect(holding).toHaveLength(1)
    expect(holding[0].filter((t) => t === 'Condition')).toHaveLength(3)
  })

  test('Should be executed in full by the Medplum action, with every resource written once', async () => {
    await runMedplum()

    expect(medplumHelpers.onError).not.toHaveBeenCalled()
    const result = medplumHelpers.onComplete.mock.calls[0][0].data_points
    expect(Number(result.chunkCount)).toBeGreaterThan(1)
    const counts: Record<string, number> = {}
    for (const resource of medplum.resources) counts[resource.resourceType] = (counts[resource.resourceType] ?? 0) + 1
    expect(counts).toEqual(
      expect.objectContaining({
        Observation: OBSERVATIONS,
        Practitioner: PRACTITIONERS,
        Encounter: 1,
        Condition: 3,
        Patient: 1,
      }),
    )
    // The account Organization, once, and the one the bundle brought.
    expect(counts.Organization).toBe(2)
    expect(counts.Provenance).toBe(Number(result.chunkCount))
  }, 120000)

  test('Should leave no duplicate when the whole import is executed a second time', async () => {
    const before = medplum.resources.length

    await runMedplum()

    expect(medplumHelpers.onError).not.toHaveBeenCalled()
    expect(medplum.resources.length).toBe(before)
  }, 120000)

  test('Should say which chunk failed and from where in the source, then finish without a duplicate when run again', async () => {
    const fresh = fakeMedplum()
    fresh.withPatient()
    let sends = 0
    jest.mocked(MedplumClient).mockImplementation(
      () =>
        ({
          startClientLogin: jest.fn(),
          executeBatch: async (bundle: never) => {
            if (++sends === 6) throw new Error('503 Service Unavailable')
            return await fresh.executeBatch(bundle)
          },
        }) as unknown as MedplumClient,
    )

    await runMedplum()

    expect(medplumHelpers.onComplete).not.toHaveBeenCalled()
    const message = JSON.stringify(medplumHelpers.onError.mock.calls[0][0])
    expect(message).toMatch(/chunk 6 of \d+ \(.*source entries \d+-\d+\)/)
    expect(message).toContain('503 Service Unavailable')
    expect(message).toContain('5 of')
    expect(fresh.log).toHaveLength(5)

    // The same action, run again: the five chunks are replaced, the rest written.
    await runMedplum()

    expect(medplumHelpers.onError).not.toHaveBeenCalled()
    expect(fresh.resources.length).toBe(medplum.resources.length)
  }, 120000)
})

// A collection first, so that what is measured is what is still held and not what is waiting to be collected.
v8.setFlagsFromString('--expose-gc')
const collectGarbage = vm.runInNewContext('gc') as () => void

describe('Metriport to Medplum - memory while a very large bundle is split', () => {
  const inUse = (): number => {
    collectGarbage()
    const { heapUsed, external } = process.memoryUsage()
    return heapUsed + external
  }

  test('Should hold a fraction of a 100 MB bundle, not the bundle, while it is scanned and written', async () => {
    // Generated as it is read, so the bundle itself is never in memory, and the
    // chunks go to a store that counts them and keeps nothing.
    const observations = 31_000
    let bundleBytes = 0
    for (const piece of bundleText({ observations })) bundleBytes += Buffer.byteLength(piece)

    let peak = 0
    let lowest = Infinity
    let written = 0
    let reads = 0
    const generatedStore: Pick<ObjectStore, 'getStream' | 'put'> = {
      getStream: async () => {
        reads++
        const pieces = bundleText({ observations })
        async function* sampled(): AsyncGenerator<string> {
          let count = 0
          for (const piece of pieces) {
            yield piece
            if (++count % 1000 === 0) {
              const now = inUse()
              peak = Math.max(peak, now)
              lowest = Math.min(lowest, now)
              await new Promise((resolve) => setImmediate(resolve))
            }
          }
        }
        return Readable.from(sampled(), { objectMode: false })
      },
      put: async (name, body) => {
        written += Buffer.byteLength(body)
        return `memory://${name}`
      },
    }

    const scan = await scanBundle(generatedStore, 'memory://generated')
    const { manifest } = await buildTransactionChunks({
      store: generatedStore,
      sourceRef: 'memory://generated',
      scan,
      namePrefix: 'big/transaction',
      awellPatientId: 'p',
    })

    expect(bundleBytes).toBeGreaterThan(95 * 1024 * 1024)
    expect(manifest.totalEntries).toBe(observations + PRACTITIONERS + 1 + 3 + 1)
    // Written once, as chunks, about the size of the bundle again plus what each chunk adds.
    expect(written).toBeGreaterThan(bundleBytes * 0.9)
    // The ranks come from reading it more than once: a pass to scan and a pass for each rank.
    expect(reads).toBeGreaterThan(2)
    // What is held is an index of the resources, a few short strings each, and one
    // chunk at a time: a fraction of the bundle, which parsed whole would hold
    // several times its size.
    expect(peak - lowest).toBeLessThan(bundleBytes * 0.25)
  }, 300000)
})
