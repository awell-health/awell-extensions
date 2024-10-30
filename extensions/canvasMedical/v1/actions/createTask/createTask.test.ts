import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedSettings,
  mockedTaskData,
  mockedTaskId,
} from '../../client/__mocks__'
import { createTask } from './createTask'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createTask', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      taskData: JSON.stringify(mockedTaskData),
    },
  }

  it('should create task', async () => {
    await createTask.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { taskId: mockedTaskId },
    })
  })
})
