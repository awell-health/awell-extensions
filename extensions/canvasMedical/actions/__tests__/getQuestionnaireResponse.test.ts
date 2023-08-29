import { getQuestionnaireResponse } from '../getQuestionnaireResponse'
import {
  sampleQuestionnaireResponseResource,
  sampleQuestionnaireResponseId,
} from '../../__mocks__/questionnaireResponses'
import { generateTestPayload } from '../../../../src/tests'
import { makeAPIClient } from '../../client'
import { mockMakeAPIClient } from '../../__mocks__/canvasApiClient'

jest.mock('../../client')

describe('getQuestionnaireResponse', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: {
      client_id: '123',
      client_secret: '123',
      base_url: 'https://example.com',
      auth_url: 'https://example.com/auth/token',
      audience: undefined,
    },
    fields: {
      questionnaireResponseId: sampleQuestionnaireResponseId.id,
    },
  }
  beforeAll(async () => {
    ;(makeAPIClient as jest.Mock).mockImplementation(mockMakeAPIClient)
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should return questionnaire response', async () => {
    await getQuestionnaireResponse.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        questionnaire_response_data: JSON.stringify(
          sampleQuestionnaireResponseResource
        ),
      },
    })
  })
})
