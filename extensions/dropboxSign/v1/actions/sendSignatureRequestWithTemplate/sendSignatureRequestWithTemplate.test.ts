import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'

import { sendSignatureRequestWithTemplate } from '..'
import { generateTestPayload } from '../../../../../src/tests'

jest.mock('../../../common/sdk/dropboxSignSdk')

const mockFn = jest
  .spyOn(
    DropboxSignSdk.SignatureRequestApi.prototype,
    'signatureRequestSendWithTemplate'
  )
  .mockImplementation(async (data) => {
    console.log(
      'mocked DropboxSignSdk.SignatureRequestApi.signatureRequestSendWithTemplate',
      data
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

describe('Cancel signature request action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendSignatureRequestWithTemplate.onActivityCreated(
      generateTestPayload({
        fields: {
          signerRole: 'Client',
          signerName: 'John Doe',
          signerEmailAddress: 'hello@patient.com',
          templateId: 'template-1',
          title: 'A title',
          subject: 'A subject',
          message: 'A message',
          signingRedirectUrl: 'https://developers.hellosign.com/',
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
