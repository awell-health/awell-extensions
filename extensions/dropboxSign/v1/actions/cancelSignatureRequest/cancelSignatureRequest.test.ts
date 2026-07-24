import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { cancelSignatureRequest } from '..'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../../common/sdk/dropboxSignSdk')

const mockFn = jest
  .spyOn(DropboxSignSdk.SignatureRequestApi.prototype, 'signatureRequestCancel')
  .mockImplementation(
    jest.fn().mockResolvedValue({
      response: {
        data: {},
        status: 200,
        statusText: 'success',
        headers: {},
        config: {},
      },
    }),
  )

describe('Cancel signature request action', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    cancelSignatureRequest,
  )

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await cancelSignatureRequest.onEvent!({
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
