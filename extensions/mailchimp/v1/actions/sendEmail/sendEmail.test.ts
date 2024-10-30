import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/mailchimpSdk')

describe('Send email', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onActivityCreated!(
      generateTestPayload({
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
      onError
    )

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
