import { type ActivityEvent } from '@awell-health/extensions-core'
import { isAxiosError } from 'axios'

type ErrorCategory = 'WRONG_INPUT' | 'BAD_REQUEST' | 'SERVER_ERROR'

/**
 * Map an error thrown while calling the Bland API to an ActivityEvent with the
 * correct category.
 *
 * Taxonomy (see building-awell-extensions skill §7):
 * - 4xx (except 408/429)  -> BAD_REQUEST  (non-retryable business/permission
 *   rejection, e.g. 403 ENTERPRISE_REQUIRED, 401 bad key, 422 unprocessable)
 * - 5xx / 408 / 429 / network / timeout -> SERVER_ERROR (transient, retryable)
 *
 * Returns `undefined` for anything that isn't an Axios error so the caller can
 * re-throw it and let extensions-core's default handler deal with it.
 */
export const mapBlandErrorToActivityEvent = (
  err: unknown
): ActivityEvent | undefined => {
  if (!isAxiosError(err)) {
    return undefined
  }

  const status = err.response?.status
  const responseData = err.response?.data
  const vendorMessage =
    (typeof responseData === 'object' &&
      responseData !== null &&
      // Bland returns { errors: [{ message, error }] } or { message }
      (Array.isArray((responseData as { errors?: unknown }).errors)
        ? JSON.stringify((responseData as { errors: unknown }).errors)
        : (responseData as { message?: string }).message)) ||
    err.message

  const isTransient =
    status === undefined ||
    status >= 500 ||
    status === 408 ||
    status === 429

  const category: ErrorCategory = isTransient ? 'SERVER_ERROR' : 'BAD_REQUEST'

  const message =
    status !== undefined
      ? `Bland API responded with ${status}: ${vendorMessage}`
      : `Bland API request failed: ${vendorMessage}`

  return {
    date: new Date().toISOString(),
    text: { en: message },
    error: {
      category,
      message,
    },
  }
}
