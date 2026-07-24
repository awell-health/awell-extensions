import { generateTestPayload } from '@/tests'
import {
  mockedCreateQuestionnaireResponsesData,
  mockedCreateQuestionnaireResponsesResource,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { createQuestionnaireResponses } from './createQuestionnaireResponses'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createQuestionnaireResponses', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    createQuestionnaireResponses,
  )
  const payload = {
    settings: mockedSettings,
    fields: mockedCreateQuestionnaireResponsesData,
  }

  it('should create questionnaire responses', async () => {
    await createQuestionnaireResponses.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        questionnaireResponseId: mockedCreateQuestionnaireResponsesResource,
      },
    })
  })
})
