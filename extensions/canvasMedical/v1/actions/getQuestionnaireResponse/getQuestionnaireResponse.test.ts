import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedQuestionnaireResponseId,
  mockedQuestionnaireResponseResource,
  mockedSettings,
} from '../../client/__mocks__'
import { getQuestionnaireResponse } from './getQuestionnaireResponse'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('getQuestionnaireResponse', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      questionnaireResponseId: mockedQuestionnaireResponseId,
    },
  }

  it('should get questionnaire response', async () => {
    await getQuestionnaireResponse.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        questionnaireResponseData: JSON.stringify(
          mockedQuestionnaireResponseResource
        ),
      },
    })
  })
})
