import { type ActivityEvent } from '@awell-health/extensions-core'
import { type AxiosError, isAxiosError } from 'axios'
import { isNil } from 'lodash'
import { z } from 'zod'
import { type ZendeskApiErrorResponse } from './types'

const zendeskApiErrorSchema = z.object({
  details: z.record(z.array(z.object({
    type: z.string(),
    description: z.string(),
  }))).optional(),
  description: z.string().optional(),
  error: z.string().optional(),
})

export const isZendeskApiError = (
  error: any
): error is AxiosError<ZendeskApiErrorResponse> => {
  if (isAxiosError(error)) {
    const parseResult = zendeskApiErrorSchema.safeParse(error.response?.data)
    return parseResult.success
  }
  return false
}

export const zendeskApiErrorToActivityEvent = (
  error: AxiosError<ZendeskApiErrorResponse>
): ActivityEvent[] => {
  const errorData = error.response?.data

  if (isNil(errorData)) {
    return []
  }

  if (errorData.details && Object.keys(errorData.details).length > 0) {
    const events: ActivityEvent[] = []
    Object.entries(errorData.details).forEach(([field, fieldErrors]) => {
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach((fieldError: { type: string; description: string }) => {
          events.push({
            date: new Date().toISOString(),
            text: { en: `${field}: ${fieldError.description}` },
            error: {
              category: 'WRONG_INPUT',
              message: fieldError.description,
            },
          })
        })
      }
    })
    return events
  }

  const errorMessage = errorData.error || errorData.description || 'Unknown error'
  return [{
    date: new Date().toISOString(),
    text: { en: `Zendesk API error: ${errorMessage}` },
    error: {
      category: error.response?.status && error.response.status >= 400 && error.response.status < 500 ? 'WRONG_INPUT' : 'SERVER_ERROR',
      message: errorMessage,
    },
  }]
}
