import { TestHelpers } from '@awell-health/extensions-core'
import { BlandApiClient } from '../../../api/client'
import { sendCall as action } from '../sendCall'

const mockedCallResponse = async () => {
  return {
    data: {
      status: 'success',
      call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
    },
  } as any
}

describe('Bland.ai - Send call', () => {
  let sendCallSpy: jest.SpyInstance

  const {
    extensionAction: sendCall,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    sendCallSpy = jest
      .spyOn(BlandApiClient.prototype, 'sendCall')
      .mockImplementation(mockedCallResponse)
  })

  test('Should work', async () => {
    await sendCall.onEvent({
      payload: {
        fields: {
          phoneNumber: '1234567890',
          task: 'Some task',
          requestData: JSON.stringify({
            name: 'John Doe',
          }),
          analysisSchema: JSON.stringify({
            name: 'string',
          }),
          otherData: JSON.stringify({
            foo: 'bar',
          }),
        },
        patient: {
          id: 'patient-id',
        },
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
          tenant_id: '123',
        },
        activity: {
          id: 'activity-id',
        },
        settings: {
          apiKey: 'api-key',
        },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(sendCallSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: 'bar',
      }),
    )

    // Completion happens async via a Webhook from Bland
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: expect.objectContaining({
          call_id: '9d404c1b-6a23-4426-953a-a52c392ff8f1',
        }),
        events: expect.any(Array),
      }),
    )
  })

  test('Should work with async completion via fields.webhook and completeExtensionActivityAsync', async () => {
    await sendCall.onEvent({
      payload: {
        fields: {
          phoneNumber: '1234567890',
          task: 'Some task',
          webhook: 'https://webhook.site/1234567890',
          completeExtensionActivityAsync: true,
        },
        patient: { id: 'patient-id' },
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
          tenant_id: '123',
        },
        activity: { id: 'activity-id' },
        settings: { apiKey: 'api-key' },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(sendCallSpy).toHaveBeenCalled()
    expect(sendCallSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        webhook: 'https://webhook.site/1234567890?activity_id=activity-id',
      }),
    )
    // Completion happens async via a Webhook from Bland
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should use otherData.webhook and call onComplete (no async)', async () => {
    await sendCall.onEvent({
      payload: {
        fields: {
          phoneNumber: '1234567890',
          task: 'Some task',
          otherData: JSON.stringify({
            webhook: 'https://example.com/otherdata',
          }),
        },
        patient: { id: 'patient-id' },
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
          tenant_id: '123',
        },
        activity: { id: 'activity-id' },
        settings: { apiKey: 'api-key' },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(sendCallSpy).toHaveBeenCalledWith(
      expect.objectContaining({ webhook: 'https://example.com/otherdata' }),
    )
    // Not async completion => onComplete should be called
    expect(onComplete).toHaveBeenCalled()
  })

  test('Should override fields.webhook with otherData.webhook and call onComplete (no async)', async () => {
    await sendCall.onEvent({
      payload: {
        fields: {
          phoneNumber: '1234567890',
          task: 'Some task',
          webhook: 'https://webhook.site/fields',
          otherData: JSON.stringify({
            webhook: 'https://webhook.site/otherdata',
          }),
        },
        patient: { id: 'patient-id' },
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
          tenant_id: '123',
        },
        activity: { id: 'activity-id' },
        settings: { apiKey: 'api-key' },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // otherData.webhook should override fields.webhook
    expect(sendCallSpy).toHaveBeenCalledWith(
      expect.objectContaining({ webhook: 'https://webhook.site/otherdata' }),
    )
    // Not async completion => onComplete should be called
    expect(onComplete).toHaveBeenCalled()
  })
})
