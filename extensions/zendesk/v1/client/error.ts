import { type ActivityEvent } from '@awell-health/extensions-core'
import { type AxiosError, isAxiosError } from 'axios'
import { isNil } from 'lodash'
import { z } from 'zod'
import { type ErrorResponse } from './types'

const errorSchema = z.object({
  error: z.string(),
  description: z.string(),
  details: z.object({
    value: z.array(z.object({ type: z.string(), description: z.string() })),
  }),
})

export const isZendeskError = (
  error: any
): error is AxiosError<ErrorResponse> => {
  if (isAxiosError(error)) {
    const parseResult = errorSchema.safeParse(error)
    return parseResult.success
  }

  return false
}

export const zendeskErrorToActivityEvent = (
  error: AxiosError<ErrorResponse>
): ActivityEvent[] => {
  const errorData = error.response?.data

  if (isNil(errorData)) {
    return []
  }

  const title = `${errorData.error}: ${errorData.description}`
  const message = errorData.details?.value
    ?.map((value) => `${value.type}: ${value.description}`)
    .join('. ')

  return [
    {
      date: new Date().toISOString(),
      text: { en: title },
      error: {
        category: 'SERVER_ERROR',
        message,
      },
    },
  ]
}
