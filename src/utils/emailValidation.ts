import { z } from 'zod'

/**
 * Very basic email validation
 * - Trims any leading or trailing whitespace
 */
export const emailSchema = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')

/**
 * Helper function to create an optional email schema allows undefined and empty strings
 */
export const optionalEmailSchema = z
  .string()
  .optional()
  .refine(
    (val) =>
      val === undefined || val === '' || emailSchema.safeParse(val).success,
    'Invalid email format',
  )
