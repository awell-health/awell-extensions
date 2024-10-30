import { sendQuestionnaire } from '.'
import { generateTestPayload } from '@/tests'

describe('Send questionnaire', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      questionnaireId: 'test-questionnaire',
    },
    settings: {},
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendQuestionnaire.onActivityCreated!(basePayload, onComplete, onError)

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
