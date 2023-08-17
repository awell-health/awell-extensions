/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Fields,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { taskWithIdSchema } from '../validation/dto/task.zod'
import type schemas from '../schemas'

const fields = {
  task_data: {
    id: 'task_data',
    label: 'Task data',
    description: 'Task data',
    type: FieldType.JSON,
    jsonType: 'canvas_task',
    required: true,
  },
} satisfies Fields<typeof schemas>

const dataPoints = {
  taskId: {
    key: 'taskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const updateTask: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints,
  typeof schemas
> = {
  key: 'updateTask',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Task',
  description: 'Update a task',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const taskData = JSON.parse(payload.fields.task_data as string)
      const task = taskWithIdSchema.parse(taskData)

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const { id } = await api.updateTask(task)
      await onComplete({
        data_points: {
          taskId: String(id),
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
                category: 'SERVER_ERROR',
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
                category: 'BAD_REQUEST',
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
