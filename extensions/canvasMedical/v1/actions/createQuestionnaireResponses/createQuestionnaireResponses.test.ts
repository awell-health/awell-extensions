import { generateTestPayload } from '@/tests'
import {
  mockedCreateQuestionnaireResponsesData,
  mockedCreateQuestionnaireResponsesResource,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { createQuestionnaireResponses } from './createQuestionnaireResponses'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createQuestionnaireResponses', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: mockedCreateQuestionnaireResponsesData,
  }

  it('should create questionnaire responses', async () => {
    await createQuestionnaireResponses.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        questionnaireResponseId: mockedCreateQuestionnaireResponsesResource,
      },
    })
  })
})
