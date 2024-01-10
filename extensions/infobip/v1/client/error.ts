import { type ActivityEvent } from '@awell-health/extensions-core'
import { type AxiosError, isAxiosError } from 'axios'
import { isNil } from 'lodash'
import { z } from 'zod'
import { type ResponseError } from '../types'

const errorSchema = z.object({
  requestError: z.object({
    serviceException: z.object({
      messageId: z.coerce.string(),
      text: z.string(),
    }),
  }),
})

export const isInfobipError = (
  error: any
): error is AxiosError<ResponseError> => {
  if (isAxiosError(error)) {
    const parseResult = errorSchema.safeParse(error.response?.data)
    return parseResult.success
  }

  return false
}

export const infobipErrorToActivityEvent = (
  error: AxiosError<ResponseError>
): ActivityEvent[] => {
  const messageId = error.response?.data.requestError.serviceException.messageId
  const text = error.response?.data.requestError.serviceException.text

  if (isNil(text)) {
    return []
  }

  return [
    {
      date: new Date().toISOString(),
      text: {
        en: messageId ?? text,
      },
      error: {
        category: 'SERVER_ERROR',
        message: text,
      },
    },
  ]
}
