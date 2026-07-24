import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedSettings,
  mockedTaskId,
  mockedTaskResource,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { updateTask } from './updateTask'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('updateTask', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updateTask)
  const payload = {
    settings: mockedSettings,
    fields: {
      taskData: JSON.stringify(mockedTaskResource),
    },
  }

  it('should update task', async () => {
    await updateTask.onEvent!({
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
