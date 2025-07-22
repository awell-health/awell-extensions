import { TestHelpers } from '@awell-health/extensions-core'
import { faxReceived as webhook } from '.'
import { faxReceivedPayload } from './__testdata__/faxReceived.mock'

describe('WestFax - Webhook - Fax received', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  describe('When payload is valid', () => {
    test('Should call onSuccess, which starts the care flow', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: faxReceivedPayload,
          settings: {
            domain: 'domain',
            apiKey: 'apiKey',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalled()
    })
  })
})
