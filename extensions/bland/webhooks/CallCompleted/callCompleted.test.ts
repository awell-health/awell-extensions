import { TestHelpers } from '@awell-health/extensions-core'
import { callCompleted as webhook } from '.'
import { callCompletedPayload } from './__testdata__/callCompleted.mock'

describe('Webhook - Call completed', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
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
          callObject: JSON.stringify(callCompletedPayload),
        },
      })
    })
  })
})
