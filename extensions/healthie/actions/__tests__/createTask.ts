import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { createTask } from '../createTask'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

const samplePayload = {
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
}

const sampleTask = {
  patientId: undefined,
  assignToUserId: undefined,
  content: 'content',
  dueDate: undefined,
  reminder: undefined,
}

describe('createTask action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a task', async () => {
    await createTask.onActivityCreated(samplePayload, onComplete, onError)

    expect(mockGetSdkReturn.createTask).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        taskId: 'task-1',
      },
    })
  })

  describe('Reminder validation', () => {
    describe('No reminder', () => {
      test.each([false, undefined])(
        'Should call onComplete when isReminderEnabled is %p and rest is undefined',
        async (value) => {
          await createTask.onActivityCreated(
            {
              ...samplePayload,
              fields: {
                ...samplePayload.fields,
                isReminderEnabled: value,
              },
            },
            onComplete,
            onError
          )

          expect(onComplete).toHaveBeenCalled()
          expect(mockGetSdkReturn.createTask).toHaveBeenCalledWith(sampleTask)
        }
      )

      test('Should call onError when isReminderEnabled is undefined and any of the rest fields is not undefined', async () => {
        await createTask.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              reminderTime: 1,
            },
          },
          onComplete,
          onError
        )

        expect(onError).toHaveBeenCalled()
      })
    })

    describe('Reminder = daily', () => {
      test.each([
        {
          reminderTime: 1,
        },
        {
          reminderTime: '1',
        },
      ])('Should call onComplete when %p', async (value) => {
        await createTask.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              reminderIntervalType: 'daily',
              isReminderEnabled: true,
              ...(value as any),
            },
          },
          onComplete,
          onError
        )

        expect(onComplete).toHaveBeenCalled()
        expect(mockGetSdkReturn.createTask).toHaveBeenCalledWith({
          ...sampleTask,
          reminder: {
            is_enabled: true,
            interval_type: 'daily',
            interval_value: undefined,
            reminder_time: 1,
          },
        })
      })

      test('Should call onError when reminderIntervalValue is not undefined', async () => {
        await createTask.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              reminderIntervalType: 'daily',
              isReminderEnabled: true,
              reminderIntervalValue: '',
              reminderTime: 1,
            },
          },
          onComplete,
          onError
        )

        expect(onError).toHaveBeenCalled()
      })
    })

    describe('Reminder = weekly', () => {
      test.each([
        {
          reminderIntervalValue: 'monday',
        },
        {
          reminderIntervalValue: 'tuesday',
        },
      ])('Should call onComplete when %p', async (value) => {
        await createTask.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              reminderIntervalType: 'weekly',
              reminderTime: 1,
              isReminderEnabled: true,
              ...(value as any),
            },
          },
          onComplete,
          onError
        )

        expect(onComplete).toHaveBeenCalled()
        expect(mockGetSdkReturn.createTask).toHaveBeenCalledWith({
          ...sampleTask,
          reminder: {
            is_enabled: true,
            interval_type: 'weekly',
            interval_value: value.reminderIntervalValue,
            reminder_time: 1,
          },
        })
      })

      test('Should call onError when reminderIntervalValue is not known day of week', async () => {
        await createTask.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              reminderIntervalType: 'weekly',
              isReminderEnabled: true,
              reminderIntervalValue: 'test',
              reminderTime: 1,
            },
          },
          onComplete,
          onError
        )

        expect(onError).toHaveBeenCalled()
      })
    })

    describe('Reminder = once', () => {
      test('Should call onComplete when reminderIntervalValue is correct date', async () => {
        await createTask.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              reminderIntervalType: 'once',
              reminderTime: 1,
              isReminderEnabled: true,
              reminderIntervalValue: '2023-04-13',
            },
          },
          onComplete,
          onError
        )

        expect(onComplete).toHaveBeenCalled()
        expect(mockGetSdkReturn.createTask).toHaveBeenCalledWith({
          ...sampleTask,
          reminder: {
            is_enabled: true,
            interval_type: 'once',
            interval_value: '2023-04-13',
            reminder_time: 1,
          },
        })
      })

      test('Should call onError when reminderIntervalValue is incorrect date', async () => {
        await createTask.onActivityCreated(
          {
            ...samplePayload,
            fields: {
              ...samplePayload.fields,
              reminderIntervalType: 'once',
              isReminderEnabled: true,
              reminderIntervalValue: '',
              reminderTime: 1,
            },
          },
          onComplete,
          onError
        )

        expect(onError).toHaveBeenCalled()
      })
    })
  })
})
