import { type ActivityEvent } from '@awell-health/extensions-core'
import { type AxiosError, isAxiosError } from 'axios'
import { isNil } from 'lodash'
import { z } from 'zod'
import { type SalesApiErrorResponse } from './types'

const errorSchema = z.object({
  errors: z.array(
    z.object({
      error: z.object({
        resource: z.string(),
        field: z.string(),
        code: z.string(),
        message: z.string(),
        details: z.string(),
      }),
      meta: z.object({}),
    })
  ),
  meta: z.object({}),
})

export const isZendeskError = (
  error: any
): error is AxiosError<SalesApiErrorResponse> => {
  if (isAxiosError(error)) {
    const parseResult = errorSchema.safeParse(error)
    return parseResult.success
  }

  return false
}

export const zendeskErrorToActivityEvent = (
  error: AxiosError<SalesApiErrorResponse>
): ActivityEvent[] => {
  const errorData = error.response?.data

  if (isNil(errorData) || errorData.errors?.length === 0) {
    return []
  }

  return errorData.errors.map((error) => {
    return {
      date: new Date().toISOString(),
      text: { en: error.error.message },
      error: {
        category: 'SERVER_ERROR',
        message: error.error.details,
      },
    }
  })
}
