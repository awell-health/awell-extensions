import { generateTestPayload } from '../../../../src/tests'
import { sendFax } from './sendFax'

describe('send fax action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  test('Should not send a fax', async () => {
    await sendFax.onActivityCreated(
      generateTestPayload({
        fields: {
          productId: '1c0bb9d0-00f9-471d-9b0a-c5da533f0129',
          number: '9702895979',
          content: `
          <h1 class="slate-h1">Create some nice Fax</h1><p class="slate-p">This is a simple fax to test the integration.</p><p class="slate-p"></p>
          `,
          feedbackEmail: 'nick@awellhealth.com',
          addFaceSheet: true,
        },
        settings: {
          username: 'Awell',
          password: 'wcd!AZF5vgu8jgh4mxh',
          faceSheetUrl: undefined,
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
