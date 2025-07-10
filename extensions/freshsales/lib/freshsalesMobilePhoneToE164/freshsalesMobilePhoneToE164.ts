import { isEmpty, isNil } from 'lodash'
import { E164PhoneValidationSchema } from '@awell-health/extensions-core'

export const FreshSalesMobilePhoneToE164ErrorMessage =
  "Could not convert the lead's phone number to the E164 format."

/**
 * Converts a mobile phone number from the Freshsales format to the E164 format.
 *
 * Example:
 * 1-926-652-9503 -> +19266529503
 *
 * @param phone - The mobile phone number to convert.
 * @returns The E164 formatted phone number.
 */
export const freshsalesMobilePhoneToE164 = (
  phone?: string | null,
): string | undefined => {
  if (isNil(phone) || isEmpty(phone)) return undefined

  /**
   * If the phone number is already in the E164 format, return it as is.
   */
  const initialResult = E164PhoneValidationSchema.safeParse(phone)
  if (initialResult.success) return initialResult.data

  /**
   * If it's not in the E164 format, we'll attempt to clean it up.
   */
  const cleanedPhone = phone.replace(/\D/g, '')
  const withInternationalPrefix = `+${cleanedPhone}`

  E164PhoneValidationSchema.parse(withInternationalPrefix, {
    errorMap: () => ({
      message: FreshSalesMobilePhoneToE164ErrorMessage,
    }),
  })

  return withInternationalPrefix
}
