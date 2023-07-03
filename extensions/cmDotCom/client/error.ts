import { type ActivityEvent } from '@awell-health/extensions-core'
import { type MessageResponse } from './types'

export const isSmsError = (error: any): error is MessageResponse => {
  return (
    'data' in error &&
    'details' in error.data &&
    typeof error.data.details === 'string' &&
    'errorCode' in error.data
  )
}

export const smsErrorToActivityEvent = (
  error: MessageResponse
): ActivityEvent[] => {
  if (error.data.messages?.length > 0) {
    return error.data.messages.map((errorItem) => {
      const errorCode = errorItem.messageErrorCode
      const errorDetails = errorItem.messageDetails
      const message = `(${errorCode}) ${errorDetails}`

      return {
        date: new Date().toISOString(),
        text: { en: message },
        error: {
          category: 'SERVER_ERROR',
          message,
        },
      }
    })
  }

  const errorCode = error.data.errorCode
  const errorDetails = error.data.details
  const message = `(${errorCode}) ${errorDetails}`

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
