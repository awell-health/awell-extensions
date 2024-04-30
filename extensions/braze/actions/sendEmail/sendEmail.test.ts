import { generateTestPayload } from '../../../../src/tests'
import { sendEmail } from './sendEmail'

describe('send email action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  test('Should not send an email', async () => {
    await sendEmail.onActivityCreated(
      generateTestPayload({
        fields: {
          appId: 'appId',
          from: '234234234234',
          body: `
          <h1 class="slate-h1">Create some nice email</h1><p class="slate-p">This is a simple email body to test the integration.</p><p class="slate-p"></p>
          `,
        },
        settings: {
          apiUrl: 'https://api.braze.com',
          apiKey: 'somewrongapikey',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
