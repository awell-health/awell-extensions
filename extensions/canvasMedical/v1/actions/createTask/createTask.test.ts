import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedSettings,
  mockedTaskData,
  mockedTaskId,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { createTask } from './createTask'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createTask', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createTask)
  const payload = {
    settings: mockedSettings,
    fields: {
      taskData: JSON.stringify(mockedTaskData),
    },
  }

  it('should create task', async () => {
    await createTask.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { taskId: mockedTaskId },
    })
  })
})
