import {
  mockedTaskData,
  ZendeskClientMockImplementation,
} from '../../client/__mocks__'
import { createTask } from '..'
import { generateTestPayload } from '../../../../../src/tests'

jest.mock('../../client')

describe('Create task', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      content: mockedTaskData.content,
      dueDate: mockedTaskData.due_date,
      ownerId: mockedTaskData.owner_id,
      resourceType: mockedTaskData.resource_type,
      resourceId: mockedTaskData.resource_id,
      completed: mockedTaskData.completed,
      remindAt: mockedTaskData.remind_at,
    },
    settings: {
      salesApiToken: 'salesApiToken',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await createTask.onActivityCreated(basePayload, onComplete, onError)

    expect(
      ZendeskClientMockImplementation.salesApi.createTask
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
