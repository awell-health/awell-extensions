import { sendEmailWithTemplate } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../../common/sdk/mailgunSdk')

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
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
