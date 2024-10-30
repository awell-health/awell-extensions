import { generateTestPayload } from '@/tests'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'

import { createEmbeddedSignatureRequestWithTemplate } from './createEmbeddedSignatureRequestWithTemplate'

jest.mock('../../../common/sdk/dropboxSignSdk')

const mocksignatureRequestCreateEmbeddedWithTemplate = jest
  .spyOn(
    DropboxSignSdk.SignatureRequestApi.prototype,
    'signatureRequestCreateEmbeddedWithTemplate'
  )
  .mockImplementation(
    jest.fn().mockResolvedValue({
      body: {
        signatureRequest: {
          signatureRequestId: 'signature-request-id',
          signatures: [
            {
              signatureId: 'test-signature-id',
            },
          ],
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

const mockEmbeddedApiEmbeddedSignUrl = jest
  .spyOn(DropboxSignSdk.EmbeddedApi.prototype, 'embeddedSignUrl')
  .mockImplementation(
    jest.fn().mockResolvedValue({
      body: {
        embedded: {
          signUrl: 'https://developers.awellhealth.com',
          expiresAt: 1535074721,
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

describe('Create embedded signature request with template', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await createEmbeddedSignatureRequestWithTemplate.onActivityCreated!(
      generateTestPayload({
        fields: {
          signerRole: 'Client',
          signerName: 'John Doe',
          signerEmailAddress: 'hello@patient.com',
          templateId: 'template-1',
          title: 'A title',
          subject: 'A subject',
          message: 'A message',
          customFields: JSON.stringify([
            {
              name: 'hello',
              value: 'world',
            },
          ]),
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

    expect(mocksignatureRequestCreateEmbeddedWithTemplate).toHaveBeenCalled()
    expect(mockEmbeddedApiEmbeddedSignUrl).toHaveBeenCalled()

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
