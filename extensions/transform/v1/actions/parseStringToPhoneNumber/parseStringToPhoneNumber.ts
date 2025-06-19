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
  onEvent: async ({ payload, onComplete }) => {
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
        throw new ZodError(parsed.error.issues)
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
      return E164PhoneValidationSchema.parse(withCode)
    }

    await onComplete({
      data_points: {
        phoneNumber: getPhoneNumber(),
      },
      events,
    })
  },
}
