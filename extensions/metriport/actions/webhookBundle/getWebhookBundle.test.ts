import { generateTestPayload } from '@/tests'
import { getWebhookBundle } from './getWebhookBundle'
import { fetchBundle } from './fetchBundle'
import { patientAdmitBundle } from './bundle/__testdata__/patientAdmitBundle'

jest.mock('./fetchBundle')

const mockedFetchBundle = fetchBundle as jest.MockedFunction<typeof fetchBundle>

const settings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
  rateLimitDuration: '',
}

describe('Metriport - Get Webhook Bundle', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should fetch the bundle from the URL and return it as a data point', async () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: { resourceType: 'Encounter', id: 'enc-1' } }],
    }
    mockedFetchBundle.mockResolvedValue(bundle as never)

    await getWebhookBundle.onActivityCreated!(
      generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
    )

    expect(mockedFetchBundle).toHaveBeenCalledWith(
      'https://example.com/encounter-bundle',
    )
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bundle: JSON.stringify(bundle),
      },
    })
  })

  test('Should call onError when the URL is invalid', async () => {
    await getWebhookBundle.onActivityCreated!(
      generateTestPayload({
        fields: {
          url: 'not-a-url',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
    )

    expect(mockedFetchBundle).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('Should emit an importable transaction bundle for an encounter bundle', async () => {
    mockedFetchBundle.mockResolvedValue(patientAdmitBundle as never)

    await getWebhookBundle.onActivityCreated!(
      generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: 'patient.admit',
          provenanceReason: 'Inpatient admission',
        },
        settings,
      }),
      onComplete,
      onError,
    )

    expect(onError).not.toHaveBeenCalled()

    const dataPoints = onComplete.mock.calls[0][0].data_points
    expect(dataPoints.bundle).toBe(JSON.stringify(patientAdmitBundle))

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

    await getWebhookBundle.onActivityCreated!(
      generateTestPayload({
        fields: {
          url: 'https://example.com/other-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
    )

    expect(onError).not.toHaveBeenCalled()
    expect(
      onComplete.mock.calls[0][0].data_points.transactionBundle,
    ).toBeUndefined()
  })

  test('Should call onError when a collection bundle has no Encounter', async () => {
    mockedFetchBundle.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: 'p1' } }],
    } as never)

    await getWebhookBundle.onActivityCreated!(
      generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
      'has no Encounter entry',
    )
  })

  test('Should call onError when the fetch fails', async () => {
    mockedFetchBundle.mockRejectedValue(new Error('URL expired'))

    await getWebhookBundle.onActivityCreated!(
      generateTestPayload({
        fields: {
          url: 'https://example.com/encounter-bundle',
          eventType: undefined,
          provenanceReason: undefined,
        },
        settings,
      }),
      onComplete,
      onError,
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
