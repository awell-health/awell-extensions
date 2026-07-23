import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { TestHelpers } from '@awell-health/extensions-core'

import { sendRequestReminder } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/dropboxSignSdk')

const mockFn = jest
  .spyOn(DropboxSignSdk.SignatureRequestApi.prototype, 'signatureRequestRemind')
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

describe('Send request reminder action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendRequestReminder)

  beforeEach(() => {
    onError.mockClear()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendRequestReminder.onEvent!({
      payload: generateTestPayload({
        fields: {
          signatureRequestId: '123',
          signerEmailAddress: 'hello@patient.com',
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
