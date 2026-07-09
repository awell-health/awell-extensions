import { TestHelpers } from '@awell-health/extensions-core'
import { BlandApiClient } from '../../../api/client'
import { sendSms as action } from '../sendSms'

const responseData = {
  message: 'SMS sent successfully',
  conversation_id: 'convo_abc123',
  workflow_id: 'workflow_xyz789',
  message_id: 'msg_123',
}

const sendSmsMock = jest.fn().mockResolvedValue({
  data: {
    data: responseData,
    errors: null,
  },
})

jest.mock('../../../api/client', () => ({
  BlandApiClient: jest.fn().mockImplementation(() => ({
    sendSms: sendSmsMock,
  })),
}))

const mockedSdk = jest.mocked(BlandApiClient)

const basePayload = {
  fields: {
    to: '+12223334444',
    agentNumber: '+17163511654',
    text: 'Hello from Awell',
  },
  settings: {
    apiKey: 'api-key',
  },
  patient: { id: 'patient-1' },
  pathway: { id: 'pathway-1', definition_id: 'definition-1' },
  activity: { id: 'activity-1' },
} as any

describe('Bland.ai - Send SMS', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    sendSmsMock.mockClear()
  })

  test('Should send the SMS and complete with the returned data points', async () => {
    await extensionAction.onEvent({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockedSdk).toHaveBeenCalled()

    // Sends the mapped snake_case body + an idempotency key derived from the activity id.
    const [sentBody, idempotencyKey] = sendSmsMock.mock.calls[0]
    expect(sentBody).toMatchObject({
      to: '+12223334444',
      agent_number: '+17163511654',
      text: 'Hello from Awell',
      request_data: expect.objectContaining({
        awell_patient_id: 'patient-1',
        awell_activity_id: 'activity-1',
      }),
    })
    expect(idempotencyKey).toBe('activity-1')

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        conversationId: responseData.conversation_id,
        workflowId: responseData.workflow_id,
        messageId: responseData.message_id,
        message: responseData.message,
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when Bland returns errors', async () => {
    sendSmsMock.mockResolvedValueOnce({
      data: {
        data: null,
        errors: [{ message: 'Invalid agent number' }],
      },
    })

    await extensionAction.onEvent({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({ category: 'BAD_REQUEST' }),
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should map a 4xx HTTP error to a non-retryable BAD_REQUEST', async () => {
    sendSmsMock.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed with status code 403',
      response: {
        status: 403,
        data: {
          data: null,
          errors: [
            {
              message: 'This feature is only available for enterprise users',
              error: 'ENTERPRISE_REQUIRED',
            },
          ],
        },
      },
    })

    await extensionAction.onEvent({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({ category: 'BAD_REQUEST' }),
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should map a 5xx HTTP error to a retryable SERVER_ERROR', async () => {
    sendSmsMock.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed with status code 502',
      response: { status: 502, data: { message: 'Bad gateway' } },
    })

    await extensionAction.onEvent({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({ category: 'SERVER_ERROR' }),
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
