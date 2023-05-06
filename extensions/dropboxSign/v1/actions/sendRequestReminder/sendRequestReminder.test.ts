import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'

import { sendRequestReminder } from '..'

jest.mock('../../../common/sdk/dropboxSignSdk')

const mockFn = jest
  .spyOn(DropboxSignSdk.SignatureRequestApi.prototype, 'signatureRequestRemind')
  .mockImplementation(async (signatureRequestId, data, options) => {
    console.log(
      'mocked DropboxSignSdk.SignatureRequestApi.signatureRequestRemind',
      { signatureRequestId, data, options }
    )

    return {
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
    }
  })

describe('Send request reminder action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onError.mockClear()
    onComplete.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendRequestReminder.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          signatureRequestId: '123',
          signerEmailAddress: 'hello@patient.com',
        },
        settings: {
          apiKey: 'apiKey',
          clientId: 'client-id',
          testMode: 'yes',
        },
      },
      onComplete,
      jest.fn(),
      {}
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
