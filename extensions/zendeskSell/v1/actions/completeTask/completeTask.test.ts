import {
  mockedTaskData,
  ZendeskClientMockImplementation,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { completeTask } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Complete task', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(completeTask)

  const basePayload = generateTestPayload({
    fields: {
      taskId: mockedTaskData.id,
    },
    settings: {
      salesApiToken: 'salesApiToken',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await completeTask.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      ZendeskClientMockImplementation.salesApi.updateTask,
    ).toHaveBeenCalledWith(basePayload.fields.taskId, {
      completed: true,
    })
    expect(onComplete).toHaveBeenCalledWith()
    expect(onError).not.toHaveBeenCalled()
  })
})
