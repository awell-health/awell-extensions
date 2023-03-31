import { createEmbeddedSignatureRequestWithTemplate } from '..'

describe('Create embedded signature request action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
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
          customFields: String([]),
        },
        settings: {
          apiKey: 'apiKey',
          clientId: 'client-id',
        },
      },
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
