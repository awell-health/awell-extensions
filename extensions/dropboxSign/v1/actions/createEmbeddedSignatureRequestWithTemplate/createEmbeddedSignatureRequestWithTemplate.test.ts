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
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
