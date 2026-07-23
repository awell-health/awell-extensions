import { sendQuestionnaire } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Send questionnaire', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendQuestionnaire)

  const basePayload = generateTestPayload({
    fields: {
      questionnaireId: 'test-questionnaire',
    },
    settings: {},
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendQuestionnaire.onEvent!({
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
