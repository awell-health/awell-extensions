import { type E164Number } from 'libphonenumber-js'
import {
  DateTimeOptionalSchema,
  E164PhoneValidationOptionalSchema,
} from '@awell-health/extensions-core'
import { type ActivityEvent } from '@awell-health/extensions-core'
import { type GetUserQuery } from '../sdk/graphql-codegen/generated/sdk'

interface ValidateResult {
  data: { phoneNumber?: E164Number; dob?: string }
  events?: ActivityEvent[]
}
export const validateGetPatient = (
  user: GetUserQuery['user']
): ValidateResult => {
  const phoneValidationResult = E164PhoneValidationOptionalSchema.safeParse(
    user?.phone_number
  )
  const dobValidationResult = DateTimeOptionalSchema.safeParse(user?.dob)

  return {
    data: {
      dob: dobValidationResult.success ? dobValidationResult.data : undefined,
      phoneNumber: phoneValidationResult.success
        ? phoneValidationResult.data
        : undefined,
    },
    events:
      phoneValidationResult.success && dobValidationResult.success
        ? undefined
        : ([
            ...(phoneValidationResult.success
              ? []
              : [
                  {
                    date: new Date().toISOString(),
                    text: {
                      en: `Phone number from Healthie (${String(
                        user?.phone_number
                      )}) not stored because it isn't a valid E.164 phone number`,
                    },
                    error: {
                      category: 'WRONG_DATA',
                      message: `Phone number from Healthie (${String(
                        user?.phone_number
                      )}) not stored because it isn't a valid E.164 phone number`,
                    },
                  },
                ]),
            ...(dobValidationResult.success
              ? []
              : [
                  {
                    date: new Date().toISOString(),
                    text: {
                      en: `DOB from Healthie (${String(
                        user?.dob
                      )}) not stored because it isn't a valid ISO8601 date`,
                    },
                    error: {
                      category: 'WRONG_DATA',
                      message: `DOB from Healthie (${String(
                        user?.dob
                      )}) not stored because it isn't a valid ISO8601 date`,
                    },
                  },
                ]),
          ] as ActivityEvent[]),
  }
}
