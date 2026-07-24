import { sendMessage } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Send message', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendMessage)

  const basePayload = generateTestPayload({
    fields: {
      subject: 'test-subject',
      body: 'test-body',
    },
    settings: {},
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendMessage.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
