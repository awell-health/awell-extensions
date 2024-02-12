import { generateTestPayload } from '../../../../src/tests'
import { sendFax } from './sendFax'

describe('send fax action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  test('Should not send a fax', async () => {
    await sendFax.onActivityCreated(
      generateTestPayload({
        fields: {
          productId: 'wrongproductid',
          number: '234234234234',
          content: `
          <h1 class="slate-h1">Create some nice Fax</h1><p class="slate-p">This is a simple fax to test the integration.</p><p class="slate-p"></p>
          `,
          feedbackEmail: undefined,
          addFaceSheet: false,
        },
        settings: {
          username: 'asd',
          password: 'somewrongpass',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
