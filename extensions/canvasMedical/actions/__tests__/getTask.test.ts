import { getTask } from '../getTask'
import { taskResource } from '../../__mocks__/task'
import { generateTestPayload } from '../../../../src/tests'
import { makeAPIClient } from '../../client'
import { mockMakeAPIClient } from '../../__mocks__/canvasApiClient'

jest.mock('../../client')

describe('getTask', () => {
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
      taskId: taskResource.id,
    },
  }
  beforeAll(async () => {
    ;(makeAPIClient as jest.Mock).mockImplementation(mockMakeAPIClient)
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should return task', async () => {
    await getTask.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { task_data: JSON.stringify(taskResource) },
    })
  })
})
