import { z } from 'zod'

/**
 * Custom email validation using a specific regex pattern
 * Pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
 * This pattern ensures:
 * - Username can contain letters, numbers, and special characters ._%+-
 * - Domain can contain letters, numbers, dots, and hyphens
 * - TLD must be at least 2 characters long and contain only letters
 * - Trims any leading or trailing whitespace
 */
export const emailSchema = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Invalid email format',
  )

/**
 * Helper function to create an optional email schema
 */
export const optionalEmailSchema = emailSchema.optional()
