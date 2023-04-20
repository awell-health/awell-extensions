import { type E164Number } from 'libphonenumber-js'
import {
  DateTimeSchema,
  E164PhoneValidationSchema,
} from '../../../lib/shared/validation'
import { makeStringOptional } from '../../../lib/shared/validation/generic'
import { type ActivityEvent } from '../../../lib/types/ActivityEvent'
import { type GetUserQuery } from '../gql/sdk'

const optionalPhoneSchema = makeStringOptional(E164PhoneValidationSchema)
const optionalDobSchema = makeStringOptional(DateTimeSchema)

interface ValidateResult {
  data: { phoneNumber?: E164Number; dob?: string }
  events?: ActivityEvent[]
}
export const validateGetPatient = (
  user: GetUserQuery['user']
): ValidateResult => {
  const phoneValidationResult = optionalPhoneSchema.safeParse(
    user?.phone_number
  )
  const dobValidationResult = optionalDobSchema.safeParse(user?.dob)

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
                      en: "Phone number from Healthie not stored because it isn't a valid E.164 phone number",
                    },
                    error: {
                      category: 'WRONG_DATA',
                      message:
                        "Phone number from Healthie not stored because it isn't a valid E.164 phone number",
                    },
                  },
                ]),
            ...(dobValidationResult.success
              ? []
              : [
                  {
                    date: new Date().toISOString(),
                    text: {
                      en: "DOB from Healthie not stored because it isn't a valid ISO8601 date",
                    },
                    error: {
                      category: 'WRONG_DATA',
                      message:
                        "DOB from Healthie not stored because it isn't a valid ISO8601 date",
                    },
                  },
                ]),
          ] as ActivityEvent[]),
  }
}
