import { type Action, type DataPointDefinition } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { ResponseError } from '@sendgrid/helpers/classes'
import {
  SendgridClient,
  mapSendgridErrorsToActivityErrors,
} from '../../../client'

const dataPoints = {
  importStatus: {
    key: 'importStatus',
    valueType: 'string'
  }
} satisfies Record<string, DataPointDefinition>

export const importStatus: Action<typeof fields, typeof settings, keyof typeof dataPoints> = {
  key: 'importStatus',
  title: 'Status of Import',
  description: 'Get the status of an Import job',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { jobId},
        settings: { apiKey }
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema, 
          settings: SettingsValidationSchema
        }),
        payload,
      })

      const sendgridClient = new SendgridClient({ apiKey })
      const sgImportStatus = await sendgridClient.marketing.contacts.importStatus(jobId)
      
      await onComplete({
        data_points: {
          importStatus: sgImportStatus[0].body.status
        }
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: {
                category: 'WRONG_INPUT',
                message: `${error.message}`,
              },
            },
          ],
        })
        return
      } else if (err instanceof ResponseError) {
        const events = mapSendgridErrorsToActivityErrors(err)
        await onError({
          events,
        })
        return
      }

      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
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
