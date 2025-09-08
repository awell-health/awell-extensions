import {
  mockedDates,
  mockedTaskData,
  ZendeskClientMockImplementation,
} from '../../client/__mocks__'
import { createTask } from './createTask'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Zendesk Sell - createTask', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

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
  })

  test('Should call the onComplete callback', async () => {
    await createTask.onActivityCreated!(basePayload, onComplete, onError)

    expect(
      ZendeskClientMockImplementation.salesApi.createTask
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        content: mockedTaskData.content,
        owner_id: mockedTaskData.owner_id,
        resource_type: mockedTaskData.resource_type,
        resource_id: mockedTaskData.resource_id,
        completed: mockedTaskData.completed,
      })
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { taskId: String(mockedTaskData.id) },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
