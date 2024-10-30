import { sendWhatsAppMessage } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/messagebirdSdk')

describe('Send WhatsApp message', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendWhatsAppMessage.onActivityCreated!(
      generateTestPayload({
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
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
