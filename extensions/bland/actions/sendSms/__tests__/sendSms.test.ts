import { TestHelpers } from '@awell-health/extensions-core'
import { BlandApiClient } from '../../../api/client'
import { sendSms as action } from '../sendSms'

const smsResponse = {
  data: {
    conversation_id: 'conv-123',
    status: 'sent',
  },
  errors: null,
}

jest.mock('../../../api/client', () => ({
  BlandApiClient: jest.fn().mockImplementation(() => ({
    sendSms: jest.fn().mockResolvedValue({
      data: smsResponse,
    }),
  })),
}))

const mockedSdk = jest.mocked(BlandApiClient)

describe('Bland.ai - Send SMS', () => {
  const {
    extensionAction: sendSms,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should send an SMS with an explicit agent message', async () => {
    await sendSms.onEvent({
      payload: {
        fields: {
          userNumber: '+12223334444',
          agentNumber: '+18162392019',
          agentMessage: 'Hello from Awell',
          requestData: '{"patient_name":"Jane"}',
        },
        settings: {
          apiKey: 'api-key',
        },
        patient: { id: 'patient-id' },
        pathway: { id: 'pathway-id', definition_id: 'definition-id' },
        activity: { id: 'activity-id' },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockedSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: {
          conversationId: 'conv-123',
          smsResponse: JSON.stringify(smsResponse),
        },
      }),
    )
  })

  test('Should allow omitting the agent message (pathway-generated)', async () => {
    await sendSms.onEvent({
      payload: {
        fields: {
          userNumber: '+12223334444',
          agentNumber: '+18162392019',
        },
        settings: {
          apiKey: 'api-key',
        },
        patient: { id: 'patient-id' },
        pathway: { id: 'pathway-id', definition_id: 'definition-id' },
        activity: { id: 'activity-id' },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalled()
  })

  test('Should append activity_id to the webhook URL', async () => {
    await sendSms.onEvent({
      payload: {
        fields: {
          userNumber: '+12223334444',
          agentNumber: '+18162392019',
          agentMessage: 'Hello from Awell',
          webhook: 'https://example.com/webhooks/bland/sms',
        },
        settings: {
          apiKey: 'api-key',
        },
        patient: { id: 'patient-id' },
        pathway: { id: 'pathway-id', definition_id: 'definition-id' },
        activity: { id: 'activity-id' },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const sdkInstance =
      mockedSdk.mock.results[mockedSdk.mock.results.length - 1].value
    expect(sdkInstance.sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        webhook:
          'https://example.com/webhooks/bland/sms?activity_id=activity-id',
      }),
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
