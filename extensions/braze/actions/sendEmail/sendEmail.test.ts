import { generateTestPayload } from '../../../../src/tests'
import { sendEmail } from './sendEmail'
jest.mock('../../client/brazeApi')

describe('send email action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should send an email', async () => {
    await sendEmail.onActivityCreated(
      generateTestPayload({
        fields: {
          appId: 'appId',
          fromName: 'From Name',
          fromEmail: 'test@test.com',
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

    expect(onComplete).toHaveBeenCalledWith({
      data_points: { dispatchId: 'email-sent-id' },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should not send an email when apiKey is empty', async () => {
    await sendEmail.onActivityCreated(
      generateTestPayload({
        fields: {
          appId: 'appId',
          fromName: 'From Name',
          fromEmail: 'test@test.com',
          body: `
          <h1 class="slate-h1">Create some nice email</h1><p class="slate-p">This is a simple email body to test the integration.</p><p class="slate-p"></p>
          `,
        },
        settings: {
          apiUrl: 'https://api.braze.com',
          apiKey: '',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should not send an email when body is empty', async () => {
    await sendEmail.onActivityCreated(
      generateTestPayload({
        fields: {
          appId: 'appId',
          fromName: 'From Name',
          fromEmail: 'test@test.com',
          body: '',
        },
        settings: {
          apiUrl: 'https://api.braze.com',
          apiKey: 'whatever',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
