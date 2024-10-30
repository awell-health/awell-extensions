import { sendEmailWithTemplate } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/mailchimpSdk')

describe('Send email with template', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmailWithTemplate.onActivityCreated!(
      generateTestPayload({
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
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
