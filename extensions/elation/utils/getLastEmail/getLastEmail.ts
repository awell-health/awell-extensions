import { isEmpty, isNil } from 'lodash'
import { type Email } from '../../types/patient'

export const getLastEmail = (emails?: Email[]): string | undefined => {
  if (isNil(emails)) return undefined

  /**
   * Filter out emails without a deleted_date
   */
  const availableEmails = emails.filter(
    (email) => isNil(email.deleted_date) || isEmpty(email.deleted_date)
  )

  /**
   * According to Elation's documentation there is only only 1 email with empty deleted_date
   */
  if (availableEmails.length === 1) {
    return availableEmails[0].email
  }

  return undefined
}
