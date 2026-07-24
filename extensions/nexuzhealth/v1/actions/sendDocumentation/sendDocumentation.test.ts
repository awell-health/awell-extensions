import { sendDocumentation } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Send documentation', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendDocumentation)

  const basePayload = generateTestPayload({
    fields: {
      documentationId: 'test-documentation',
    },
    settings: {},
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendDocumentation.onEvent!({
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
