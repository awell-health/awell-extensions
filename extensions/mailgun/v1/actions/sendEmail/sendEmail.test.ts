import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/mailgunSdk')

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
          domain: 'a-domain',
          fromName: 'John Doe',
          fromEmail: 'hello@awellhealth.com',
          region: 'EU',
          testMode: 'yes',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when there is a validation error', async () => {
    await sendEmail.onActivityCreated!(
      generateTestPayload({
        fields: {
          to: 'email@hello.com',
          subject: 'A subject',
          body: "<h1>Don't shout!</h1>",
        },
        settings: {
          apiKey: 'an-api-key',
          domain: 'a-domain',
          fromName: 'John Doe',
          fromEmail: 'hello@awellhealth.com',
          region: 'not-a-valid-region', // Should be "EU" or "US"
          testMode: 'yes',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
