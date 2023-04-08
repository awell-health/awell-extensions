import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'

import { createEmbeddedSignatureRequestWithTemplate } from './createEmbeddedSignatureRequestWithTemplate'

jest.mock('../../../common/sdk/dropboxSignSdk')

const mocksignatureRequestCreateEmbeddedWithTemplate = jest
  .spyOn(
    DropboxSignSdk.SignatureRequestApi.prototype,
    'signatureRequestCreateEmbeddedWithTemplate'
  )
  .mockImplementation(async (data) => {
    console.log(
      'mocked DropboxSignSdk.SignatureRequestApi.signatureRequestCreateEmbeddedWithTemplate',
      data
    )

    return {
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
    }
  })

const mockEmbeddedApiEmbeddedSignUrl = jest
  .spyOn(DropboxSignSdk.EmbeddedApi.prototype, 'embeddedSignUrl')
  .mockImplementation(async (data) => {
    console.log(
      'mocked DropboxSignSdk.SignatureRequestApi.signatureRequestCreateEmbeddedWithTemplate',
      data
    )

    return {
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
    }
  })

describe('Create embedded signature request with template', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await createEmbeddedSignatureRequestWithTemplate.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          signerRole: 'Client',
          signerName: 'John Doe',
          signerEmailAddress: 'hello@patient.com',
          templateId: 'template-1',
          title: 'A title',
          subject: 'A subject',
          message: 'A message',
        },
        settings: {
          apiKey: 'apiKey',
          clientId: 'client-id',
          testMode: 'yes',
        },
      },
      onComplete,
      jest.fn()
    )

    expect(mocksignatureRequestCreateEmbeddedWithTemplate).toHaveBeenCalled()
    expect(mockEmbeddedApiEmbeddedSignUrl).toHaveBeenCalled()

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        signUrl: 'https://developers.awellhealth.com',
        expiresAt: '2018-08-24T03:38:41+02:00',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
