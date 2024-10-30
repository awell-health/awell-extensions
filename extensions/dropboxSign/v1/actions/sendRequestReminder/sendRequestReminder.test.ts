import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'

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
    })
  )

describe('Send request reminder action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onError.mockClear()
    onComplete.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendRequestReminder.onActivityCreated!(
      generateTestPayload({
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
      jest.fn()
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
