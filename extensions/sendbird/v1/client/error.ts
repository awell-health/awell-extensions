import { type ActivityEvent } from '@awell-health/extensions-core'
import { type AxiosError, isAxiosError } from 'axios'
import { type ErrorResponse } from './types'

export const isSendbirdChatError = (
  error: any
): error is AxiosError<ErrorResponse> => {
  if (isAxiosError(error)) {
    const errorData = error.response?.data
    return 'error' in errorData && 'code' in errorData && 'message' in errorData
  }

  return false
}

export const sendbirdChatErrorToActivityEvent = (
  error: AxiosError<ErrorResponse>
): ActivityEvent[] => {
  const errorData = error.response?.data

  const message = `(CODE: ${errorData?.code ?? ''}) ${errorData?.message ?? ''}`

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
