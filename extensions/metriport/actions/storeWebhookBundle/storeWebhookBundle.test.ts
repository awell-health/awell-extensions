import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { storeWebhookBundle } from './storeWebhookBundle'
import { fetchBundle } from '../../shared/fetchBundle'
import { patientAdmitBundle } from '../webhookBundle/bundle/__testdata__/patientAdmitBundle'
import { dischargeSummaryBundle } from '../../ingestion/adt/__testdata__/dischargeSummaryBundle'
import { getWebhookBundle } from '../webhookBundle/getWebhookBundle'

jest.mock('../../shared/fetchBundle')

const mockedFetchBundle = fetchBundle as jest.MockedFunction<typeof fetchBundle>

const settings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
  rateLimitDuration: '',
}

const NATS_MAX_PAYLOAD = 5 * 1024 * 1024

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

  const refOfPut = async (call: number): Promise<string> =>
    await (helpers.objectStore.put as jest.Mock).mock.results[call].value

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should store the bundle and return a reference to it instead of the bundle', async () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: { resourceType: 'Encounter', id: 'enc-1' } }],
    }
    mockedFetchBundle.mockResolvedValue(bundle as never)

    await run()

    expect(onError).not.toHaveBeenCalled()
    expect(helpers.objectStore.put).toHaveBeenCalledTimes(1)
    expect(helpers.objectStore.put).toHaveBeenCalledWith(
      'metriport/activity-id/bundle.json',
      JSON.stringify(bundle),
    )
    const bundleRef = await refOfPut(0)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { bundleRef, encounterId: 'enc-1' },
    })
    expect(await helpers.objectStore.get(bundleRef)).toBe(
      JSON.stringify(bundle),
    )
  })

  test('Should store the importable transaction bundle of an encounter bundle', async () => {
    mockedFetchBundle.mockResolvedValue(patientAdmitBundle as never)

    await run({
      eventType: 'patient.admit',
      provenanceReason: 'Inpatient admission',
    })

    expect(onError).not.toHaveBeenCalled()
    expect(helpers.objectStore.put).toHaveBeenCalledTimes(2)
    expect(helpers.objectStore.put).toHaveBeenCalledWith(
      'metriport/activity-id/transaction-bundle.json',
      expect.any(String),
    )

    const bundleRef = await refOfPut(0)
    const transactionBundleRef = await refOfPut(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bundleRef,
        transactionBundleRef,
        encounterId: 'c60544e1-2e37-45fb-8160-3d583902cfde',
      },
    })

    const transactionBundle = JSON.parse(
      await helpers.objectStore.get(transactionBundleRef),
    )
    expect(transactionBundle.resourceType).toBe('Bundle')
    expect(transactionBundle.type).toBe('transaction')
    // 'test-patient' is the default patient id from generateTestPayload
    expect(JSON.stringify(transactionBundle)).toContain(
      'Patient?identifier=https://awellhealth.com/patients|test-patient',
    )
    const provenance = transactionBundle.entry.find(
      (entry: any) => entry.resource?.resourceType === 'Provenance',
    ).resource
    expect(provenance.reason).toEqual([{ text: 'Inpatient admission' }])
  })

  test('Should not store a transaction bundle when the payload is not an encounter bundle', async () => {
    mockedFetchBundle.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [],
    } as never)

    await run()

    expect(onError).not.toHaveBeenCalled()
    expect(helpers.objectStore.put).toHaveBeenCalledTimes(1)
    expect(
      onComplete.mock.calls[0][0].data_points.transactionBundleRef,
    ).toBeUndefined()
    expect(onComplete.mock.calls[0][0].data_points.encounterId).toBeUndefined()
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
      mockedFetchBundle.mockResolvedValue(bundle as never)
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

  test('Should not write what the bundle identifies to the log', async () => {
    mockedFetchBundle.mockResolvedValue(patientAdmitBundle as never)

    await run({ eventType: 'patient.admit' })

    // 987654321 is the visit number the Encounter carries as an identifier.
    expect(JSON.stringify((helpers.log as jest.Mock).mock.calls)).not.toContain(
      '987654321',
    )
  })

  test('Should complete with a small result however large the bundle is', async () => {
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
    mockedFetchBundle.mockResolvedValue(hugeBundle as never)

    await run({ eventType: 'patient.admit' })

    expect(onError).not.toHaveBeenCalled()
    expect(JSON.stringify(onComplete.mock.calls[0][0]).length).toBeLessThan(
      1000,
    )
    const bundleRef = await refOfPut(0)
    expect(await helpers.objectStore.get(bundleRef)).toBe(
      JSON.stringify(hugeBundle),
    )
  })

  test('Should call onError and store nothing when an encounter bundle has no Encounter', async () => {
    mockedFetchBundle.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: 'p1' } }],
    } as never)

    await run({ eventType: 'patient.admit' })

    // The bundle is rejected before anything is stored, so a retry finds no
    // orphan object.
    expect(helpers.objectStore.put).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
      'has no Encounter entry',
    )
  })

  test('Should call onError and store nothing when the URL is invalid', async () => {
    await run({ url: 'not-a-url' })

    expect(mockedFetchBundle).not.toHaveBeenCalled()
    expect(helpers.objectStore.put).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('Should call onError when the fetch fails', async () => {
    mockedFetchBundle.mockRejectedValue(new Error('URL expired'))

    await run()

    expect(helpers.objectStore.put).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain('URL expired')
  })

  test('Should call onError when the bundle cannot be stored', async () => {
    mockedFetchBundle.mockResolvedValue(patientAdmitBundle as never)
    ;(helpers.objectStore.put as jest.Mock).mockRejectedValueOnce(
      new Error('bucket unavailable'),
    )

    await run({ eventType: 'patient.admit' })

    expect(onComplete).not.toHaveBeenCalled()
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
      'bucket unavailable',
    )
  })

  test('Should call onError when the transaction bundle cannot be stored after the bundle was', async () => {
    mockedFetchBundle.mockResolvedValue(patientAdmitBundle as never)
    ;(helpers.objectStore.put as jest.Mock)
      .mockResolvedValueOnce('memory://first')
      .mockRejectedValueOnce(new Error('bucket unavailable'))

    await run({ eventType: 'patient.admit' })

    expect(helpers.objectStore.put).toHaveBeenCalledTimes(2)
    expect(onComplete).not.toHaveBeenCalled()
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
      'bucket unavailable',
    )
  })
})
