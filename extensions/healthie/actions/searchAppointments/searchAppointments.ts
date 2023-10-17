import { HealthieError, mapHealthieToActivityError } from '../../errors'
import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../../gql/sdk'
import { initialiseClient } from '../../graphqlClient'
import { settingsValidationSchema, type settings } from '../../settings'
import { fields, dataPoints } from './config'
import { fromZodError } from 'zod-validation-error'
import { ZodError, z } from 'zod'
import { fieldsValidationSchema } from './config/fields'
import { isNil } from 'lodash'
import moment from 'moment-timezone'

export const searchAppointments: Action<typeof fields, typeof settings> = {
  key: 'searchAppointments',
  category: Category.EHR_INTEGRATIONS,
  title: 'Search appointments',
  description: 'Search for appointments in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings,
        fields: {
          userId,
          timezone,
          startDate,
          endDate,
          filter,
          appointmentTypeId,
        },
      } = validate({
        schema: z.object({
          settings: settingsValidationSchema,
          fields: fieldsValidationSchema,
        }),
        payload,
      })

      const client = initialiseClient(settings)
      if (client != null) {
        const sdk = getSdk(client)
        const { data } = await sdk.appointments({
          user_id: userId,
          startDate: convertDateToTimeZone(startDate, timezone),
          endDate: convertDateToTimeZone(endDate, timezone),
          filter,
          filter_by_appointment_type_id: appointmentTypeId,
        })

        const appointmentId =
          data.appointments === undefined || data.appointments?.length === 0
            ? undefined
            : data.appointments?.[0].id

        const results = isNil(data.appointmentsCount)
          ? '0'
          : data.appointmentsCount?.toString()

        await onComplete({
          data_points: {
            results,
            appointmentId,
          },
        })
      }
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
      } else if (err instanceof HealthieError) {
        const errors = mapHealthieToActivityError(err.errors)
        await onError({
          events: errors,
        })
      } else {
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
    }
  },
}

const convertDateToTimeZone = (
  isoDate: string,
  targetTimeZone: string
): string => {
  const date = moment(isoDate)
  date.tz(targetTimeZone)
  return date.format()
}
