import { generateTestPayload } from '../../../../src/tests'
import { makeAPIClient } from '../../client'
import { mockMakeAPIClient } from '../../__mocks__/canvasApiClient'
import {
  sampleCreateQuestionnaireResponsesResource,
  sampleCreateQuestionnaireResponsesData,
} from '../../__mocks__/questionnaireResponses'
import { createQuestionnaireResponses } from '../createQuestionnaireResponses'

jest.mock('../../client')

describe('createQuestionnaireResponses', () => {
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
    fields: sampleCreateQuestionnaireResponsesData,
  }

  beforeAll(async () => {
    ;(makeAPIClient as jest.Mock).mockImplementation(mockMakeAPIClient)
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should create task', async () => {
    await createQuestionnaireResponses.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { taskId: sampleCreateQuestionnaireResponsesResource.id },
    })
  })
})
