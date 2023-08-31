import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, fieldsValidationSchema } from './config'
import {
  isAxiosError,
  isZodError,
  parseAxiosError,
  parseUnknowError,
  parseZodError,
} from '../../utils'
import { z } from 'zod'
import { type AxiosError } from 'axios'
import { makeAPIClient } from '../../client'
import { taskSchema } from '../../validation'

export const createTask: Action<typeof fields, typeof settings> = {
  key: 'createTask',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Task',
  description: 'Create a task',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      validate({
        schema: z.object({
          fields: fieldsValidationSchema,
        }),
        payload,
      })

      const taskData = taskSchema.parse(
        JSON.parse(payload.fields.taskData as string)
      )

      const api = makeAPIClient(payload.settings)
      const taskId = await api.createTask(taskData)

      await onComplete({
        data_points: {
          taskId,
        },
      })
    } catch (error) {
      let parsedError

      if (isZodError(error)) {
        parsedError = parseZodError(error)
      } else if (isAxiosError(error)) {
        parsedError = parseAxiosError(error as AxiosError)
      } else {
        parsedError = parseUnknowError(error as Error)
      }
      await onError({
        events: [parsedError],
      })
    }
  },
}
