import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { isNil } from 'lodash'

/**
 * Elation is a US-only EHR and they store mobile numbers without country code.
 * We can only work with mobile phones (e.g. to send an SMS) if the phone number is
 * in international (E.164) format so will have to parse the phone number.
 *
 * If we can't parse the phone number to international format, we'll set the
 * mobile phone to undefined.
 */
export const elationMobilePhoneToE164 = (
  phoneNumber: string | undefined
): string | undefined => {
  if (isNil(phoneNumber)) return undefined

  const parsedNumber = parsePhoneNumberFromString(phoneNumber, 'US')

  if (isNil(parsedNumber) || !parsedNumber.isValid()) {
    return undefined
  }

  return parsedNumber.format('E.164')
}
