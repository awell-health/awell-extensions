import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { TestHelpers } from '@awell-health/extensions-core'

import { sendSignatureRequestWithTemplate } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/dropboxSignSdk')

const mockFn = jest
  .spyOn(
    DropboxSignSdk.SignatureRequestApi.prototype,
    'signatureRequestSendWithTemplate',
  )
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

describe('Cancel signature request action', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    sendSignatureRequestWithTemplate,
  )

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendSignatureRequestWithTemplate.onEvent!({
      payload: generateTestPayload({
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
      onError,
      helpers,
      attempt: 1,
    })
    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
