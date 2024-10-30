import { createTask } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../api/__mocks__'
import { mockCreateTaskResponse } from '../../api/__mocks__/mockTask'

jest.mock('../../api/client')

describe('Dock Health - Create task', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
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

    await createTask.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        taskId: mockCreateTaskResponse.id,
      },
    })
  })
})
