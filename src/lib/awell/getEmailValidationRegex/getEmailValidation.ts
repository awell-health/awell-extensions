import { z } from 'zod'

/**
 * Get the zod validation schema for email addresses
 * We need the local part to allows special characters like accents (é) as per modern email standards (UTF-8 encoding).
 */
export const getEmailValidation = (): z.ZodTypeAny => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return z.string().regex(emailRegex)
}
