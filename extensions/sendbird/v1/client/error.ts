import { type ActivityEvent } from '@awell-health/extensions-core'
import { type ErrorResponse } from './types'

export const isSendbirdError = (error: any): error is ErrorResponse => {
  return 'error' in error && 'code' in error && 'message' in error
}

export const sendbirdErrorToActivityEvent = (
  error: ErrorResponse
): ActivityEvent[] => {
  const message = `(CODE: ${error.code}) ${error.message}`

  return [
    {
      date: new Date().toISOString(),
      text: { en: message },
      error: {
        category: 'SERVER_ERROR',
        message,
      },
    },
  ]
}
