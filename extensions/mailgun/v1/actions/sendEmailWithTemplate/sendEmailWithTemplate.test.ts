import { sendEmailWithTemplate } from '..'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../../common/sdk/mailgunSdk')

describe('Send email with template', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    sendEmailWithTemplate,
  )

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmailWithTemplate.onEvent!({
      payload: generateTestPayload({
        fields: {
          to: 'email@hello.com',
          subject: 'A subject',
          template: 'a-template-id',
          variables: JSON.stringify({ testVar: 'hello world' }),
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
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
