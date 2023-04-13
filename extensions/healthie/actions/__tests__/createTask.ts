import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { createTask } from '../createTask'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('createTask action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a task', async () => {
    await createTask.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          patientId: undefined,
          assignToUserId: undefined,
          content: 'content',
          dueDate: undefined,
          isReminderEnabled: false,
          reminderIntervalType: undefined,
          reminderIntervalValue: undefined,
          reminderTime: undefined,
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.createTask).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        taskId: 'task-1',
      },
    })
  })
})
