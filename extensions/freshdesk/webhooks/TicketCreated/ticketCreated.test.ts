import { TestHelpers } from '@awell-health/extensions-core'
import { ticketCreated as webhook } from '.'
import { ticketCreatedPayload } from './__testdata__/ticketCreated.mock'

describe('Freshesk - Webhook - Ticket created', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  describe('When payload is valid', () => {
    test('Should call onSuccess, which starts the care flow', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: ticketCreatedPayload,
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
