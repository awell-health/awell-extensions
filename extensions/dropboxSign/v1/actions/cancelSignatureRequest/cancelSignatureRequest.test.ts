import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { cancelSignatureRequest } from '..'
import { generateTestPayload } from '@/tests'

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
    })
  )

describe('Cancel signature request action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await cancelSignatureRequest.onActivityCreated!(
      generateTestPayload({
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
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
