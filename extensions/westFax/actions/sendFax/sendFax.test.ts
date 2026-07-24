import { generateTestPayload } from '@/tests'
import { sendFax } from './sendFax'
import fetchMock from 'jest-fetch-mock'
import { TestHelpers } from '@awell-health/extensions-core'

describe('send fax action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendFax)
  fetchMock.enableMocks()

  fetchMock.mockResponseOnce(JSON.stringify({ Success: true, Result: 'asdf' }))
  test('Mock send a fax - success', async () => {
    await sendFax.onEvent!({
      payload: generateTestPayload({
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
          productId: undefined,
          faceSheetUrl: '',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        faxId: 'asdf',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
