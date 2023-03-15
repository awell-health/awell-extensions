import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient identifier',
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
  category: 'Healthie API',
  title: 'Create task',
  description: 'Create a new task in healthie',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId, content, due_date } = fields
    const client = initialiseClient(settings)
    if (client !== undefined) {
      const sdk = getSdk(client)
      const { data } = await sdk.createTask({
        client_id: patientId,
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
  },
}
