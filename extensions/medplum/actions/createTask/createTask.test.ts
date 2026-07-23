import { createTask } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings, mockCreateTaskResponse } from '../../__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Create task', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createTask)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create a task', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
        taskTitle: 'Test task',
        description: 'A description goes here',
        status: 'requested',
        intent: 'unknown',
        priority: 'urgent',
        dueDate: '2024-05-31',
        performerType: 'Clinician',
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
