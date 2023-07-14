import {
  type Action,
  type DataPointDefinition,
} from '@awell-health/extensions-core'
import { fields } from './config'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { FieldsValidationSchema } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { ResponseError } from '@sendgrid/helpers/classes'
import {
  SendgridClient,
  mapSendgridErrorsToActivityErrors,
} from '../../../client'

const dataPoints = {
  jobId: {
    key: 'jobId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const addOrUpdateContact: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addOrUpdateContact',
  title: 'Add or update contact',
  description: 'Add or update contact',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { email, firstName, lastName, listIds, customFields },
        settings: { apiKey },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const sendgridClient = new SendgridClient({ apiKey })
      const sgResponse = await sendgridClient.marketing.contacts.addOrUpdate({
        contacts: [
          {
            email,
            first_name: firstName,
            last_name: lastName,
            custom_fields: customFields,
          },
        ],
        listIds,
      })

      await onComplete({
        data_points: {
          jobId: sgResponse[0].body.job_id,
        },
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
