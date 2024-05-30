import { z } from 'zod'

export const MessageValidationSchema = z
  .string()
  .min(1, { message: 'Missing or empty message' })
  .max(1600, { message: 'Message can not be longer than 1600 characters' })

// The expectation here is that any object can be passed
export const ParametersValidationSchema = z.string()
