import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'
import { createTaskSchema } from '../validation/createTask.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Healthie patient ID',
    description: 'The ID of the patient related to this task.',
    type: FieldType.STRING,
  },
  assignToUserId: {
    id: 'assignToUserId',
    label: 'Assign to user',
    description:
      'The ID of the user to assign the task to. If none provided, will assign the task to the user the API key is associated with.',
    type: FieldType.STRING,
  },
  content: {
    id: 'content',
    label: 'Content',
    description: 'The content of the Task.',
    type: FieldType.TEXT,
    required: true,
  },
  dueDate: {
    id: 'dueDate',
    label: 'Due date',
    description: 'The due date of the task.',
    type: FieldType.DATE,
  },
  isReminderEnabled: {
    id: 'isReminderEnabled',
    label: 'Is reminder enabled',
    description: 'Would you like to send reminders for this task?',
    type: FieldType.BOOLEAN,
  },
  reminderIntervalType: {
    id: 'reminderIntervalType',
    label: 'Reminder interval type',
    description:
      'At what interval would you like to send reminders? The options are "daily", "weekly", "once"',
    type: FieldType.STRING,
  },
  reminderIntervalValue: {
    id: 'reminderIntervalValue',
    label: 'Reminder interval value',
    description:
      'When interval type is set to "daily", leave this field blank. For "weekly" interval, send in comma separated all lower-case days of the week (e.g wednesday, friday). For "once", send in the date in ISO8601 format (e.g 2020-11-28).',
    type: FieldType.STRING,
  },
  reminderTime: {
    id: 'reminderTime',
    label: 'Reminder time',
    description:
      'Time to send the reminder. Expressed in the number of minutes from midnight.',
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>

const dataPoints = {
  taskId: {
    key: 'taskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createTask: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createTask',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create task',
  description: 'Create a new task in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload

    try {
      const { patientId, assignToUserId, content, dueDate, reminder } =
        createTaskSchema.parse(fields)

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.createTask({
          client_id: patientId,
          user_id: assignToUserId,
          content,
          due_date: dueDate,
          reminder,
        })
        await onComplete({
          data_points: {
            taskId: data.createTask?.task?.id,
          },
        })
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'API client requires an API url and API key' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing api url or api key',
              },
            },
          ],
        })
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else {
        const error = err as Error
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Healthie API reported an error' },
              error: {
                category: 'SERVER_ERROR',
                message: error.message,
              },
            },
          ],
        })
      }
    }
  },
}
