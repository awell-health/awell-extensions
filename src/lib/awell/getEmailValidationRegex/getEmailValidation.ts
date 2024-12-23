import { isEmpty } from 'lodash'
import { z } from 'zod'

/**
 * Get the zod validation schema for email addresses
 * We need the local part to allows special characters like accents (é) as per modern email standards (UTF-8 encoding).
 */
export const getEmailValidation = (): z.ZodTypeAny => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return z.string().regex(emailRegex, { message: 'Invalid email address' })
}

/**
 * Zod validation schema for multiple email addresses
 * collected via a comma separated string
 */
export const CommaSeparatedEmailsValidationSchema = z
  .string()
  .optional()
  /**
   * Transform the value to an array of email addresses
   * and trim each email address
   */
  .transform((value) => {
    if (isEmpty(value) || value === undefined) return []

    const emails = value.split(',')
    return emails
      .map((email) => {
        const trimmedEmail = email.trim()
        if (isEmpty(trimmedEmail)) return undefined
        return trimmedEmail
      })
      .filter((email) => email !== undefined) as string[]
  })
  /**
   * Validate each email address
   */
  .superRefine((emails, ctx) => {
    const emailValidation = getEmailValidation()
    emails.forEach((email) => {
      if (!emailValidation.safeParse(email).success) {
        ctx.addIssue({
          code: 'custom',
          message: `Invalid email address: ${email}`,
        })
      }
    })
  })
