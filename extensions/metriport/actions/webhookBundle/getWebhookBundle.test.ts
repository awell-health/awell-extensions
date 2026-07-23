import { generateTestPayload } from '@/tests'
import { getWebhookBundle } from './getWebhookBundle'
import { fetchBundle } from './fetchBundle'

jest.mock('./fetchBundle')

const mockedFetchBundle = fetchBundle as jest.MockedFunction<typeof fetchBundle>

const settings = { apiKey: 'test-api-key', baseUrl: '', webhookKey: '' }

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
        fields: { url: 'https://example.com/encounter-bundle' },
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
        fields: { url: 'not-a-url' },
        settings,
      }),
      onComplete,
      onError,
    )

    expect(mockedFetchBundle).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('Should call onError when the fetch fails', async () => {
    mockedFetchBundle.mockRejectedValue(new Error('URL expired'))

    await getWebhookBundle.onActivityCreated!(
      generateTestPayload({
        fields: { url: 'https://example.com/encounter-bundle' },
        settings,
      }),
      onComplete,
      onError,
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
