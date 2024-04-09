import { type ActivityEvent } from '@awell-health/extensions-core'
import { type AxiosError, isAxiosError } from 'axios'
import { isNil } from 'lodash'
import { z } from 'zod'
import { type SalesApiErrorResponse } from './types'

const salesApiErrorSchema = z.object({
  errors: z.array(
    z.object({
      error: z.object({
        resource: z.string().optional(),
        field: z.string().optional(),
        code: z.string(),
        message: z.string(),
        details: z.string().optional(),
      }),
      meta: z.object({}),
    })
  ),
  meta: z.object({}),
})

export const isSalesApiError = (
  error: any
): error is AxiosError<SalesApiErrorResponse> => {
  if (isAxiosError(error)) {
    const parseResult = salesApiErrorSchema.safeParse(error.response?.data)
    return parseResult.success
  }

  return false
}

export const salesApiErrorToActivityEvent = (
  error: AxiosError<SalesApiErrorResponse>
): ActivityEvent[] => {
  const errorData = error.response?.data

  if (isNil(errorData) || errorData.errors?.length === 0) {
    return []
  }

  return errorData.errors.map((error) => {
    return {
      date: new Date().toISOString(),
      text: {
        en: isNil(error.error.details) ? error.error.code : error.error.message,
      },
      error: {
        category: 'SERVER_ERROR',
        message: error.error.details ?? error.error.message,
      },
    }
  })
}
