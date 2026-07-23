import {
  E164PhoneValidationSchema,
  type Action,
  type ActivityEvent,
} from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z, ZodError } from 'zod'
import { isNil } from 'lodash'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const parseStringToPhoneNumber: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'parseStringToPhoneNumber',
  title: 'Parse text to phone number',
  description: 'Transform or parse text to a phone number.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing parseStringToPhoneNumber',
    )

    try {
      const {
        fields: { text, countryCallingCode },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const events: ActivityEvent[] = []

      const getPhoneNumber = (): string => {
        const parsed = E164PhoneValidationSchema.safeParse(text)

        /**
         * If E164 validation passes, the phone number is already in E164 format.
         */
        if (parsed.success) {
          events.push(
            addActivityEventLog({
              message: `Text input is a valid E164 phone number.`,
            }),
          )
          helpers.log(
            { meta, text, countryCallingCode, phoneNumber: parsed.data },
            'Parsed text to phone number',
          )
          return parsed.data
        }

        /**
         * If the country calling code is not provided, we can throw a validation error.
         */
        if (isNil(countryCallingCode)) {
          events.push(
            addActivityEventLog({
              message: `Text input is not a valid E164 phone number and no country calling code was provided.`,
            }),
          )
          const err = new ZodError(parsed.error.issues)
          helpers.log({ meta, text, countryCallingCode, err }, 'error', err)
          throw err
        }

        events.push(
          addActivityEventLog({
            message: `Text input is not a valid E164 phone number. Trying again by adding country calling code (${countryCallingCode}).`,
          }),
        )

        /**
         * Try parsing the number with the country calling code prepended this time.
         */
        const withCode = `+${countryCallingCode}${text}`
        let phoneNumber: string
        try {
          phoneNumber = E164PhoneValidationSchema.parse(withCode)
        } catch (err) {
          helpers.log({ meta, err }, 'error', err as Error)
          throw err
        }

        helpers.log(
          { meta, text, countryCallingCode, phoneNumber },
          'Parsed text to phone number',
        )
        return phoneNumber
      }

      await onComplete({
        data_points: {
          phoneNumber: getPhoneNumber(),
        },
        events,
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
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
    }
  },
}
