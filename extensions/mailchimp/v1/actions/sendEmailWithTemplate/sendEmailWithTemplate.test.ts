import { sendEmailWithTemplate } from '..'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../../common/sdk/mailchimpSdk')

describe('Send email with template', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    sendEmailWithTemplate,
  )

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmailWithTemplate.onEvent!({
      payload: generateTestPayload({
        fields: {
          to: 'email@hello.com',
          subject: 'A subject',
          templateName: 'a-template-id',
          templateContent: JSON.stringify([
            { name: 'var-a', content: 'value-a' },
            { name: 'var-b', content: 'value-b' },
          ]),
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
