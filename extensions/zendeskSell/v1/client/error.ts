import type { ActivityEvent } from '@awell-health/extensions-core'
import type { SalesApiErrorResponse } from './types'

export const isSalesApiError = (err: unknown): err is {
  response?: { data?: SalesApiErrorResponse }
} => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as any).response === 'object'
  )
}

export const salesApiErrorToActivityEvent = (err: {
  response?: { data?: SalesApiErrorResponse }
}): ActivityEvent[] => {
  const message =
    err?.response?.data?.errors?.[0]?.error?.message ||
    err?.response?.data?.errors?.[0]?.error?.details ||
    'Unknown Zendesk Sell API error'

  return [
    {
      date: new Date().toISOString(),
      text: { en: message },
      error: {
        category: 'SERVER_ERROR' as const,
        message,
      },
    },
  ]
}
