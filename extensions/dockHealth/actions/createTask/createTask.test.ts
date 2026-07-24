import { createTask } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../api/__mocks__'
import { mockCreateTaskResponse } from '../../api/__mocks__/mockTask'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../api/client')

describe('Dock Health - Create task', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createTask)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        description: 'description',
        patientId: 'test-patient-id',
        taskListId: 'test-task-list-id',
        taskGroupId: 'test-task-group-id',
      },
      settings: mockSettings,
    })

    await createTask.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        taskId: mockCreateTaskResponse.id,
      },
    })
  })
})
