import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import {
  SendbirdClient,
  isSendbirdDeskError,
  sendbirdDeskErrorToActivityEvent,
} from '../../client'
import { isEmpty } from 'lodash'

export const getCustomer: Action<typeof fields, typeof settings> = {
  key: 'getCustomer',
  title: 'Get customer',
  description: 'Gets customer using Desk API.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { applicationId, chatApiToken, deskApiToken },
        fields: { customerId },
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

      const res = await client.deskApi.getCustomer(customerId)
      const customFields = res.data.customFields?.reduce((acc, curr) => {
        return { ...acc, [curr.key]: curr.value }
      }, {})

      await onComplete({
        data_points: {
          sendbirdId: res.data.sendbirdId,
          project: String(res.data.project),
          channelType: res.data.channelType,
          displayName: res.data.displayName,
          createdAt: new Date(res.data.createdAt).toISOString(),
          customFields: !isEmpty(customFields)
            ? JSON.stringify(customFields)
            : '',
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
      } else if (isSendbirdDeskError(err)) {
        const events = sendbirdDeskErrorToActivityEvent(err)
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
