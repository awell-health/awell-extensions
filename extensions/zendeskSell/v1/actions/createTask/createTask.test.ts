import {
  mockedDates,
  mockedTaskData,
  ZendeskClientMockImplementation,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { createTask } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Create task', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createTask)

  const basePayload = generateTestPayload({
    fields: {
      content: mockedTaskData.content,
      dueDate: mockedDates.isoDate,
      ownerId: mockedTaskData.owner_id,
      resourceType: mockedTaskData.resource_type,
      resourceId: mockedTaskData.resource_id,
      completed: mockedTaskData.completed,
      remindAt: mockedDates.isoDate,
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
    await createTask.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      ZendeskClientMockImplementation.salesApi.createTask,
    ).toHaveBeenCalledWith({
      content: mockedTaskData.content,
      due_date: mockedTaskData.due_date,
      owner_id: mockedTaskData.owner_id,
      resource_type: mockedTaskData.resource_type,
      resource_id: mockedTaskData.resource_id,
      completed: mockedTaskData.completed,
      remind_at: mockedTaskData.remind_at,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { taskId: String(mockedTaskData.id) },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
