import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { initialiseClient } from '../../lib/sdk/graphql-codegen/graphqlClient'
import { type settings } from '../../settings'
import { createTaskSchema } from '../../lib/validation/createTask.zod'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import { dataPoints, fields } from './config'

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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing createTask')

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
        throw new Error('API Client is missing settings (api url or api key)')
      }
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      if (err instanceof HealthieError) {
        const errors = mapHealthieToActivityError(err.errors)
        await onError({
          events: errors,
        })
      } else {
        throw err
      }
    }
  },
}
