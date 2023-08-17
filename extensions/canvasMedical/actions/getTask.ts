import { z, ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import type schemas from '../schemas'

const fields = {
  taskId: {
    id: 'taskId',
    label: 'Task ID',
    description: 'The task ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  task_data: {
    key: 'task_data',
    valueType: 'json',
    jsonType: 'canvas_task',
  },
} satisfies Record<string, DataPointDefinition<typeof schemas>>

export const getTask: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints,
  typeof schemas
> = {
  key: 'getTask',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Task',
  description: 'Retrieve a task',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const taskId = z.string().parse(payload.fields.taskId)

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const task = await api.getTask(taskId)
      await onComplete({
        data_points: {
          task_data: JSON.stringify(task),
        },
      })
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
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
