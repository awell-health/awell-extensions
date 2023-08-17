import { createTask } from '../createTask'
import { sampleTaskData, sampleTaskId } from '../../__mocks__/task'
import { generateTestPayload } from '../../../../src/tests'
import { makeAPIClient } from '../../client'
import { mockMakeAPIClient } from '../../__mocks__/canvasApiClient'

jest.mock('../../client')

describe('createTask', () => {
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
      task_data: JSON.stringify(sampleTaskData),
    },
  }

  beforeAll(async () => {
    ;(makeAPIClient as jest.Mock).mockImplementation(mockMakeAPIClient)
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should create task', async () => {
    await createTask.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { taskId: sampleTaskId.id },
    })
  })
})
