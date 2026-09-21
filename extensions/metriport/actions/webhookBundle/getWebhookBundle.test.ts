import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { getWebhookBundle } from './getWebhookBundle'
import { fetchBundle } from '../../shared/fetchBundle'
import { patientAdmitBundle } from './bundle/__testdata__/patientAdmitBundle'

jest.mock('../../shared/fetchBundle')

const mockedFetchBundle = fetchBundle as jest.MockedFunction<typeof fetchBundle>

const settings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
  rateLimitDuration: '',
}

describe('Metriport - Get Webhook Bundle', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getWebhookBundle)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should fetch the bundle from the URL and return it as a data point', async () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: { resourceType: 'Encounter', id: 'enc-1' } }],
    }
    mockedFetchBundle.mockResolvedValue(bundle as never)

    await getWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockedFetchBundle).toHaveBeenCalledWith(
      'https://example.com/encounter-bundle',
    )
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bundle: JSON.stringify(bundle),
        encounterId: 'enc-1',
      },
    })
  })

  test('Should call onError when the URL is invalid', async () => {
    await getWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: {
          url: 'not-a-url',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockedFetchBundle).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('Should emit an importable transaction bundle for an encounter bundle', async () => {
    mockedFetchBundle.mockResolvedValue(patientAdmitBundle as never)

    await getWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: 'patient.admit',
          provenanceReason: 'Inpatient admission',
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()

    const dataPoints = onComplete.mock.calls[0][0].data_points
    expect(dataPoints.bundle).toBe(JSON.stringify(patientAdmitBundle))
    expect(dataPoints.encounterId).toBe('c60544e1-2e37-45fb-8160-3d583902cfde')

    const transactionBundle = JSON.parse(dataPoints.transactionBundle)
    expect(transactionBundle.type).toBe('transaction')
    // 'test-patient' is the default patient id from generateTestPayload
    expect(JSON.stringify(transactionBundle)).toContain(
      'Patient?identifier=https://awellhealth.com/patients|test-patient',
    )

    const provenance = transactionBundle.entry.find(
      (entry: any) => entry.resource?.resourceType === 'Provenance',
    ).resource
    expect(provenance.reason).toEqual([{ text: 'Inpatient admission' }])
    expect(provenance.activity.coding[0].code).toBe('A01')
  })

  test('Should omit the transaction bundle when the payload is not an encounter bundle', async () => {
    mockedFetchBundle.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [],
    } as never)

    await getWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: {
          url: 'https://example.com/other-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(
      onComplete.mock.calls[0][0].data_points.transactionBundle,
    ).toBeUndefined()
  })

  test('Should omit the encounter id when the bundle has no Encounter', async () => {
    mockedFetchBundle.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: { resourceType: 'Patient', id: 'p1' } }],
    } as never)

    await getWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: {
          url: 'https://example.com/other-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete.mock.calls[0][0].data_points.encounterId).toBeUndefined()
  })

  test('Should call onError when a collection bundle has no Encounter', async () => {
    mockedFetchBundle.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: 'p1' } }],
    } as never)

    await getWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
      'has no Encounter entry',
    )
  })

  test('Should call onError when the fetch fails', async () => {
    mockedFetchBundle.mockRejectedValue(new Error('URL expired'))

    await getWebhookBundle.onEvent!({
      payload: generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
