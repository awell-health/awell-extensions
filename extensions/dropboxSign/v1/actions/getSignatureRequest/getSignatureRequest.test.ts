import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { TestHelpers } from '@awell-health/extensions-core'

import { getSignatureRequest } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/dropboxSignSdk')

const mockFn = jest
  .spyOn(DropboxSignSdk.SignatureRequestApi.prototype, 'signatureRequestGet')
  .mockImplementation(
    jest.fn().mockResolvedValue({
      body: {
        signatureRequest: {
          title: 'test-title',
        },
      },
      response: {
        data: {},
        status: 200,
        statusText: 'success',
        headers: {},
        config: {},
      },
    }),
  )

describe('Get signature request action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getSignatureRequest)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await getSignatureRequest.onEvent!({
      payload: generateTestPayload({
        fields: {
          signatureRequestId: '123',
        },
        settings: {
          apiKey: 'apiKey',
          clientId: 'client-id',
          testMode: 'yes',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
