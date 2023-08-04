import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import {
  SendbirdClient,
  isSendbirdError,
  sendbirdErrorToActivityEvent,
} from '../../client'

export const createCustomer: Action<typeof fields, typeof settings> = {
  key: 'createCustomer',
  title: 'Create customer',
  description: 'Creates customer using Desk API.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { applicationId, chatApiToken, deskApiToken },
        fields: { sendbirdId },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = new SendbirdClient({
        applicationId,
        chatApiToken,
        deskApiToken,
      })

      const res = await client.deskApi.createCustomer({
        sendbirdId,
      })

      await onComplete({ data_points: { customerId: String(res.data.id) } })
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
      } else if (isSendbirdError(err)) {
        const events = sendbirdErrorToActivityEvent(err)
        await onError({ events })
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
