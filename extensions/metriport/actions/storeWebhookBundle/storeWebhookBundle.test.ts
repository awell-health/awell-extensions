import axios from 'axios'
import { Readable } from 'stream'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { type Bundle } from '@medplum/fhirtypes'
import { storeWebhookBundle } from './storeWebhookBundle'
import { patientAdmitBundle } from '../webhookBundle/bundle/__testdata__/patientAdmitBundle'
import { dischargeSummaryBundle } from '../../ingestion/adt/__testdata__/dischargeSummaryBundle'
import { progressNoteDischargeSummaryBundle } from '../webhookBundle/dischargeSummary/__testdata__/progressNoteDischargeSummaryBundle'
import { getWebhookBundle } from '../webhookBundle/getWebhookBundle'
import { fakeMedplum } from '../webhookBundle/chunked/__testdata__/fakeMedplum'

jest.mock('axios')
jest.mock('request-filtering-agent', () => ({
  useAgent: jest.fn(() => 'filtering-agent'),
}))

const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>

const settings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
  rateLimitDuration: '',
}

const NATS_MAX_PAYLOAD = 5 * 1024 * 1024

/**
 * What the pre-signed URL serves: the bundle, as a stream like a socket gives it,
 * in pieces, with the length the server would send. `Get Webhook Bundle` asks for
 * JSON instead, so the same bundle can be served to both.
 */
const serve = (
  bundle: unknown,
  { contentLength, text }: { contentLength?: number; text?: string } = {},
): void => {
  const body = Buffer.from(text ?? JSON.stringify(bundle))
  mockedGet.mockImplementation(async (_url, config) => {
    if (config?.responseType === 'stream') {
      const pieces: Buffer[] = []
      for (let at = 0; at < body.length; at += 16_384) pieces.push(body.subarray(at, at + 16_384))
      return {
        data: Readable.from(pieces),
        headers: { 'content-length': String(contentLength ?? body.length) },
        status: 200,
      }
    }
    return { data: bundle, headers: {}, status: 200 }
  })
}

const readAll = async (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

describe('Metriport - Store Webhook Bundle', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(storeWebhookBundle)

  const run = async (
    fields: {
      url?: string
      eventType?: string
      provenanceReason?: string
    } = {},
  ): Promise<void> => {
    await storeWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: undefined,
          provenanceReason: undefined,
          ...fields,
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
  }

  /** The chunks a manifest lists, as the Medplum action would read them. */
  const chunksOf = async (manifestRef: string): Promise<Bundle[]> => {
    const manifest = JSON.parse(await helpers.objectStore.get(manifestRef))
    const chunks: Bundle[] = []
    for (const chunk of manifest.chunks) {
      chunks.push(JSON.parse(await helpers.objectStore.get(chunk.ref)))
    }
    return chunks
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedGet.mockReset()
    clearMocks()
  })

  test('Should stream the bundle into the store, exactly as Metriport sent it, and return a reference to it', async () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: { resourceType: 'Encounter', id: 'enc-1' } }],
    }
    // Spaces and key order a re-serialisation would not keep.
    const sent = '{ "resourceType": "Bundle",\n  "type": "searchset",\n "entry": [{"resource":{"resourceType":"Encounter","id":"enc-1"}}] }'
    serve(bundle, { text: sent })

    await run()

    expect(onError).not.toHaveBeenCalled()
    expect(helpers.objectStore.putStream).toHaveBeenCalledWith(
      'metriport/activity-id/bundle.json',
      expect.any(Readable),
      { contentType: 'application/json' },
    )
    const { bundleRef } = onComplete.mock.calls[0][0].data_points
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { bundleRef, encounterId: 'enc-1' },
    })
    expect((await readAll(await helpers.objectStore.getStream(bundleRef))).toString()).toBe(sent)
  })

  test('Should not write a transaction when the payload is not an encounter bundle', async () => {
    serve({ resourceType: 'Bundle', type: 'searchset', entry: [] })

    await run()

    expect(onError).not.toHaveBeenCalled()
    expect(helpers.objectStore.put).not.toHaveBeenCalled()
    expect(onComplete.mock.calls[0][0].data_points.transactionBundleRef).toBeUndefined()
    expect(onComplete.mock.calls[0][0].data_points.encounterId).toBeUndefined()
  })

  describe('an encounter bundle', () => {
    test('Should split it into transactions that Medplum executes, and return the reference to the list of them', async () => {
      serve(patientAdmitBundle)

      await run({ eventType: 'patient.admit', provenanceReason: 'Inpatient admission' })

      expect(onError).not.toHaveBeenCalled()
      const dataPoints = onComplete.mock.calls[0][0].data_points
      expect(dataPoints).toEqual({
        bundleRef: expect.any(String),
        transactionBundleRef: expect.any(String),
        encounterId: 'c60544e1-2e37-45fb-8160-3d583902cfde',
      })

      const manifest = JSON.parse(await helpers.objectStore.get(dataPoints.transactionBundleRef))
      expect(manifest).toEqual(
        expect.objectContaining({ kind: 'transaction-chunks', version: 1, sourceRef: dataPoints.bundleRef }),
      )
      const chunks = await chunksOf(dataPoints.transactionBundleRef)
      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks.every((chunk) => chunk.type === 'transaction')).toBe(true)
      // 'test-patient' is the default patient id from generateTestPayload
      expect(JSON.stringify(chunks)).toContain(
        'Patient?identifier=https://awellhealth.com/patients|test-patient',
      )
      const provenances = chunks.flatMap((chunk) =>
        (chunk.entry ?? []).filter((e) => e.resource?.resourceType === 'Provenance'),
      ) as Array<{ resource: { reason: unknown } }>
      expect(provenances.length).toBe(chunks.length)
      expect(provenances[0].resource.reason).toEqual([{ text: 'Inpatient admission' }])
    })

    test('Should write the same resources as Get Webhook Bundle’s single transaction would, and the same again when sent twice', async () => {
      serve(patientAdmitBundle)
      await run({ eventType: 'patient.admit' })
      const medplum = fakeMedplum()
      medplum.withPatient()

      const chunks = await chunksOf(onComplete.mock.calls[0][0].data_points.transactionBundleRef)
      for (const chunk of chunks) await medplum.executeBatch(chunk)
      for (const chunk of chunks) await medplum.executeBatch(chunk)

      const written = medplum.resources.filter(
        (r) => r.resourceType !== 'Patient' && r.resourceType !== 'Provenance',
      )
      const source = (patientAdmitBundle.entry ?? []).filter(
        (e) => e.resource?.resourceType !== 'Patient',
      )
      // One more: the account Organization.
      expect(written).toHaveLength(source.length + 1)
    })

    test('Should call onError, and write no transaction, when it has no Encounter', async () => {
      serve({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [{ resource: { resourceType: 'Patient', id: 'p1' } }],
      })

      await run({ eventType: 'patient.admit' })

      expect(onComplete).not.toHaveBeenCalled()
      expect(JSON.stringify(onError.mock.calls[0][0])).toContain('has no Encounter entry')
      expect(helpers.objectStore.put).not.toHaveBeenCalled()
    })

    test('Should call onError, naming the type and nothing of the content, when a resource has no id', async () => {
      serve({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          { resource: { resourceType: 'Patient', id: 'p1' } },
          { resource: { resourceType: 'Encounter', id: 'e1' } },
          { resource: { resourceType: 'Observation', valueString: 'MRN 987654321' } },
        ],
      })

      await run({ eventType: 'patient.admit' })

      expect(onComplete).not.toHaveBeenCalled()
      const message = JSON.stringify(onError.mock.calls[0][0])
      expect(message).toContain('Observation entry is missing an id')
      expect(message).not.toContain('987654321')
      expect(helpers.objectStore.put).not.toHaveBeenCalled()
    })
  })

  // The Medplum bots that sync Tasks read `encounter_id` from the care flow's
  // baseline data points, and the care flow fills it from this output. A flow
  // that moves to this action must get the same value Get Webhook Bundle gave it.
  test.each([
    ['an admit', patientAdmitBundle, 'patient.admit'],
    ['a discharge summary', dischargeSummaryBundle, 'patient.discharge-summary'],
  ])(
    'Should return, as a plain data point, the Encounter id that Get Webhook Bundle returns for %s',
    async (_name, bundle, eventType) => {
      serve(bundle)
      const previous = TestHelpers.fromAction(getWebhookBundle)
      await getWebhookBundle.onEvent!({
        payload: generateTestPayload({
          fields: {
            url: 'https://example.com/encounter-bundle',
            eventType,
            provenanceReason: undefined,
          },
          settings,
        }),
        onComplete: previous.onComplete,
        onError: previous.onError,
        helpers: previous.helpers,
        attempt: 1,
      })

      await run({ eventType })

      const before = previous.onComplete.mock.calls[0][0].data_points.encounterId
      const after = onComplete.mock.calls[0][0].data_points.encounterId
      expect(before).toBe('c60544e1-2e37-45fb-8160-3d583902cfde')
      expect(after).toBe(before)
    },
  )

  test('Should return the discharge summary fields as plain data points for a discharge summary document', async () => {
    serve(progressNoteDischargeSummaryBundle)

    await run({ eventType: 'patient.discharge-summary' })

    expect(onError).not.toHaveBeenCalled()
    const dataPoints = onComplete.mock.calls[0][0].data_points
    expect(dataPoints).toMatchObject({
      bundleRef: expect.any(String),
      reasonForVisit: 'Chest pain',
      visitDiagnosis: 'Chest pain, unspecified (R07.9); Essential hypertension (I10)',
      planOfTreatment: expect.stringContaining('cardiology'),
      procedures: expect.stringContaining('CT Head WO contrast'),
      procedureNote: expect.stringContaining('No acute intracranial abnormality'),
      dischargeDisposition: 'Home',
      dischargeDispositionCode: 'home',
      dischargeInstructions: expect.stringContaining('Take aspirin 81 mg daily.'),
    })
    expect(JSON.parse(dataPoints.dischargeSummaryCoverage).documentType).toBe('11506-3')
    // The fields are what the care flow reads; the bundle itself stays stored.
    expect(JSON.stringify(onComplete.mock.calls[0][0]).length).toBeLessThan(5000)
  })

  test('Should not return discharge summary fields for an encounter bundle', async () => {
    serve(patientAdmitBundle)

    await run({ eventType: 'patient.admit' })

    const dataPoints = onComplete.mock.calls[0][0].data_points
    expect(Object.keys(dataPoints).sort()).toEqual([
      'bundleRef',
      'encounterId',
      'transactionBundleRef',
    ])
  })

  test('Should not write what the bundle identifies to the log', async () => {
    serve(patientAdmitBundle)

    await run({ eventType: 'patient.admit' })

    // 987654321 is the visit number the Encounter carries as an identifier.
    expect(JSON.stringify((helpers.log as jest.Mock).mock.calls)).not.toContain('987654321')
  })

  test('Should complete with a small result, and store the bundle whole, however large it is', async () => {
    const hugeBundle = {
      ...patientAdmitBundle,
      entry: [
        ...(patientAdmitBundle.entry ?? []),
        {
          fullUrl: 'urn:uuid:7b3c1a52-1f1e-4d7e-9a0a-5e0c2b9d1a11',
          resource: {
            resourceType: 'Binary',
            id: '7b3c1a52-1f1e-4d7e-9a0a-5e0c2b9d1a11',
            contentType: 'text/html',
            data: 'x'.repeat(NATS_MAX_PAYLOAD + 1),
          },
        },
      ],
    }
    serve(hugeBundle)

    await run({ eventType: 'patient.admit' })

    expect(onError).not.toHaveBeenCalled()
    expect(JSON.stringify(onComplete.mock.calls[0][0]).length).toBeLessThan(1000)
    const { bundleRef, transactionBundleRef } = onComplete.mock.calls[0][0].data_points
    expect((await readAll(await helpers.objectStore.getStream(bundleRef))).toString()).toBe(
      JSON.stringify(hugeBundle),
    )
    // The resource that is over a message on its own goes in a chunk of its own.
    const chunks = await chunksOf(transactionBundleRef)
    expect(chunks.some((chunk) => JSON.stringify(chunk).length > NATS_MAX_PAYLOAD)).toBe(true)
  })

  describe('when the download is not whole', () => {
    test('Should call onError, and write no transaction, when fewer bytes arrived than the server said', async () => {
      serve(patientAdmitBundle, { contentLength: JSON.stringify(patientAdmitBundle).length + 500 })

      await run({ eventType: 'patient.admit' })

      expect(onComplete).not.toHaveBeenCalled()
      expect(JSON.stringify(onError.mock.calls[0][0])).toContain('The bundle is incomplete')
      expect(helpers.objectStore.put).not.toHaveBeenCalled()
    })

    test('Should call onError, saying the bundle is cut off, when no length was sent and the JSON stops short', async () => {
      const whole = JSON.stringify(patientAdmitBundle)
      mockedGet.mockResolvedValue({
        data: Readable.from([Buffer.from(whole.slice(0, whole.length - 200))]),
        headers: {},
        status: 200,
      })

      await run({ eventType: 'patient.admit' })

      expect(onComplete).not.toHaveBeenCalled()
      expect(JSON.stringify(onError.mock.calls[0][0])).toContain('not valid JSON, or is cut off')
      expect(helpers.objectStore.put).not.toHaveBeenCalled()
    })
  })

  test('Should write the same objects, by name, and no others, when it is run again for the same activity', async () => {
    serve(patientAdmitBundle)

    await run({ eventType: 'patient.admit' })
    const named = (): string[] =>
      [
        ...(helpers.objectStore.putStream as jest.Mock).mock.calls.map(([name]) => name),
        ...(helpers.objectStore.put as jest.Mock).mock.calls.map(([name]) => name),
      ].sort()
    const first = named()
    clearMocks()
    serve(patientAdmitBundle)
    await run({ eventType: 'patient.admit' })

    expect(onComplete.mock.calls[0][0].data_points.transactionBundleRef).toBeDefined()
    expect(named()).toEqual(first)
    expect(first.length).toBeGreaterThan(2)
  })

  test('Should call onError and store nothing when the URL is invalid', async () => {
    await run({ url: 'not-a-url' })

    expect(mockedGet).not.toHaveBeenCalled()
    expect(helpers.objectStore.putStream).not.toHaveBeenCalled()
    expect(helpers.objectStore.put).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('Should call onError when the download fails', async () => {
    mockedGet.mockRejectedValue(new Error('URL expired'))

    await run()

    expect(helpers.objectStore.putStream).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain('URL expired')
  })

  test('Should not be previewable, and be safe to retry', () => {
    expect(storeWebhookBundle.previewable).toBe(false)
    expect(storeWebhookBundle.supports_automated_retries).toBe(true)
  })
})
