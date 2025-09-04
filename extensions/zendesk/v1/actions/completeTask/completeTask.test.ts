import {
  mockedTaskData,
  ZendeskClientMockImplementation,
} from '../../../../zendeskSell/v1/client/__mocks__'
import { completeTask } from '../../../../zendeskSell/v1/actions/completeTask'
import { generateTestPayload } from '@/tests'

jest.mock('../../../../zendeskSell/v1/client')

describe('Complete task', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

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
  })

  test('Should call the onComplete callback', async () => {
    await completeTask.onActivityCreated!(basePayload, onComplete, onError)

    expect(
      ZendeskClientMockImplementation.salesApi.updateTask
    ).toHaveBeenCalledWith(basePayload.fields.taskId, {
      completed: true,
    })
    expect(onComplete).toHaveBeenCalledWith()
    expect(onError).not.toHaveBeenCalled()
  })
})
