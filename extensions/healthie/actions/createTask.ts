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

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Healthie patient ID',
    description: 'The ID of the patient related to this task.',
    type: FieldType.STRING,
  },
  assign_to_user_id: {
    id: 'assign_to_user_id',
    label: 'Assign to user',
    description:
      'The ID of the user to assign the task to. If none provided, will assign the task to the user the API key is associated with.',
    type: FieldType.STRING,
  },
  content: {
    id: 'content',
    label: 'Content',
    description: 'Content of the Task',
    type: FieldType.TEXT,
    required: true,
  },
  due_date: {
    id: 'due_date',
    label: 'Due date',
    description: 'The due date of the task',
    type: FieldType.STRING,
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
  category: Category.INTEGRATIONS,
  title: 'Create task',
  description: 'Create a new task in healthie',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId, assign_to_user_id, content, due_date } = fields
    try {
      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.createTask({
          client_id: patientId,
          user_id: assign_to_user_id,
          content,
          due_date,
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
  },
}
