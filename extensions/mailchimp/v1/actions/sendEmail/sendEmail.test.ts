import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../../common/sdk/mailchimpSdk')

describe('Send email', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendEmail)

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({
        fields: {
          to: 'email@hello.com',
          subject: 'A subject',
          body: "<h1>Don't shout!</h1>",
        },
        settings: {
          apiKey: 'an-api-key',
          fromName: 'John Doe',
          fromEmail: 'hello@awellhealth.com',
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
