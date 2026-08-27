import { z } from 'zod'

export const MessageValidationSchema = z
  .string()
  .min(1, {
    error: 'Missing or empty message',
  })
  .max(1600, {
    error: 'Message can not be longer than 1600 characters',
  })
