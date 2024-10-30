import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedSettings,
  mockedTaskId,
  mockedTaskResource,
} from '../../client/__mocks__'
import { updateTask } from './updateTask'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('updateTask', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      taskData: JSON.stringify(mockedTaskResource),
    },
  }

  it('should update task', async () => {
    await updateTask.onActivityCreated!(
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
