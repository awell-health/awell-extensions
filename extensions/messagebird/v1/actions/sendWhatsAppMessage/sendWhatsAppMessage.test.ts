import { sendWhatsAppMessage } from '..'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../../common/sdk/messagebirdSdk')

describe('Send WhatsApp message', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendWhatsAppMessage)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendWhatsAppMessage.onEvent!({
      payload: generateTestPayload({
        fields: {
          from: 'WHATSAPP-CHANNEL-ID',
          to: '+32xxxxxxx',
          content: 'Hello there!',
        },
        settings: {
          apiKey: 'apiKey',
          reportUrl: 'https://developers.messagebird.com/',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
