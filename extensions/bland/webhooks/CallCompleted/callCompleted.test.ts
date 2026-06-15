import { TestHelpers } from '@awell-health/extensions-core'
import { callCompleted as webhook } from '.'
import { callCompletedPayload } from './__testdata__/callCompleted.mock'

describe('Webhook - Call completed', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  describe('When call_id is missing', () => {
    test('Should call onError and not call onSuccess', async () => {
      const { call_id, ...payloadWithoutCallId } = callCompletedPayload

      await extensionWebhook.onEvent!({
        payload: {
          payload: payloadWithoutCallId as any,
          settings: { apiKey: 'api-key' },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 400,
          message: 'Missing call_id in payload',
        },
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  describe('When payload is valid', () => {
    test('Should call onSuccess, which starts the care flow', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: callCompletedPayload,
          settings: {
            apiKey: 'api-key',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          callId: callCompletedPayload.call_id,
          completed: callCompletedPayload.completed.toString(),
          status: callCompletedPayload.status,
          answeredBy: callCompletedPayload.answered_by ?? '',
          errorMessage: callCompletedPayload.error_message ?? '',
          callObject: JSON.stringify(callCompletedPayload),
        },
        patient_id: callCompletedPayload.variables?.metadata?.awell_patient_id,
      })
    })
  })
})
