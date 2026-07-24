import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedQuestionnaireResponseId,
  mockedQuestionnaireResponseResource,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { getQuestionnaireResponse } from './getQuestionnaireResponse'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('getQuestionnaireResponse', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    getQuestionnaireResponse,
  )
  const payload = {
    settings: mockedSettings,
    fields: {
      questionnaireResponseId: mockedQuestionnaireResponseId,
    },
  }

  it('should get questionnaire response', async () => {
    await getQuestionnaireResponse.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        questionnaireResponseData: JSON.stringify(
          mockedQuestionnaireResponseResource,
        ),
      },
    })
  })
})
