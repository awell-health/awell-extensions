import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedSettings,
  mockedTaskId,
  mockedTaskResource,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { getTask } from './getTask'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('getTask', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getTask)
  const payload = {
    settings: mockedSettings,
    fields: {
      taskId: mockedTaskId,
    },
  }

  it('should get task', async () => {
    await getTask.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        taskData: JSON.stringify(mockedTaskResource),
      },
    })
  })
})
