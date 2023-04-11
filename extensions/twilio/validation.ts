import { z, type ZodTypeAny } from 'zod'
import { isPossiblePhoneNumber } from 'libphonenumber-js'
import { isNil } from 'lodash'

export const Phone = z.custom<'Phone'>((val) => {
  return !isNil(val) && isPossiblePhoneNumber(val as string)
}, 'Invalid phone number')

export const Message = z.object({
  message: z
    .string()
    .min(1, { message: 'Missing or empty message' })
    .max(1600, { message: 'Message can not be longer than 1600 characters' }),
})

export const Settings = z.object({
  accountSid: z.string().min(1, { message: 'Missing Twilio account SID' }),
  authToken: z.string().min(1, { message: 'Missing Twilio auth token' }),
  fromNumber: Phone,
})

export function validate<T extends ZodTypeAny>({
  schema,
  payload,
}: {
  schema: T
  payload: unknown
}): z.infer<T> {
  const parsedData = schema.parse(payload)
  return parsedData
}
