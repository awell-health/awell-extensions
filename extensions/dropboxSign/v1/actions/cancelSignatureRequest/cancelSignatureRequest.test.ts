import { cancelSignatureRequest } from '..'

describe('Cancel signature request action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await cancelSignatureRequest.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          signatureRequestId: '123',
        },
        settings: {
          apiKey: 'apiKey',
        },
      },
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
