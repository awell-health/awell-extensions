import { type ActivityEvent } from '@awell-health/extensions-core'
import { type AxiosError, isAxiosError } from 'axios'
import { type DeskErrorResponse, type ChatErrorResponse } from './types'

export const isSendbirdChatError = (
  error: any
): error is AxiosError<ChatErrorResponse> => {
  if (isAxiosError(error)) {
    const errorData = error.response?.data
    return 'error' in errorData && 'code' in errorData && 'message' in errorData
  }

  return false
}

export const sendbirdChatErrorToActivityEvent = (
  error: AxiosError<ChatErrorResponse>
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

export const isSendbirdDeskError = (
  error: any
): error is AxiosError<DeskErrorResponse> => {
  if (isAxiosError(error)) {
    const errorData = error.response?.data
    return 'code' in errorData && 'detail' in errorData
  }

  return false
}

export const sendbirdDeskErrorToActivityEvent = (
  error: AxiosError<DeskErrorResponse>
): ActivityEvent[] => {
  const errorData = error.response?.data

  const message = `(CODE: ${errorData?.code ?? ''}) ${errorData?.detail ?? ''}`

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
