import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import { AxiosError } from 'axios'
import { type OnErrorCallback } from '@awell-health/extensions-core'
import { NameLookupError } from './nameLookup'

export const handleErrorMessage = async (
  err: any,
  onError: OnErrorCallback,
): Promise<void> => {
  if (err instanceof ZodError) {
    const error = fromZodError(err)
    await onError({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: error.message },
          error: {
            category: 'WRONG_INPUT',
            message: error.message,
          },
        },
      ],
    })
  } else if (err instanceof NameLookupError) {
    await onError({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: err.message },
          error: {
            category: 'WRONG_INPUT',
            message: err.message,
          },
        },
      ],
    })
  } else if (err instanceof AxiosError) {
    const message = formatAxiosError(err)
    await onError({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: message },
          error: {
            category: 'SERVER_ERROR',
            message,
          },
        },
      ],
    })
  } else {
    const message = (err as Error).message
    await onError({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: message },
          error: {
            category: 'SERVER_ERROR',
            message,
          },
        },
      ],
    })
  }
}

/**
 * Metriport error bodies follow RFC 7807: `title` names the problem
 * ("Missing or invalid parameters") and `detail` explains it
 * ("Invalid uuid, on [facilityId]"). The Axios message only says
 * "Request failed with status code 400", so prefer the body and fall back
 * to the Axios message only when the body carries neither field.
 */
const formatAxiosError = (err: AxiosError): string => {
  const status = err.status ?? '(no status code)'
  const title = getBodyString(err, 'title')
  const detail = getBodyString(err, 'detail')

  if (title !== undefined && detail !== undefined) {
    return `${status} ${title}: ${detail}`
  }
  if (title !== undefined) {
    return `${status} ${title}`
  }
  return `${status} Error: ${detail ?? err.message}`
}

const getBodyString = (err: AxiosError, key: string): string | undefined => {
  const data: unknown = err.response?.data
  if (typeof data !== 'object' || data === null || !(key in data)) {
    return undefined
  }
  const value = (data as Record<string, unknown>)[key]
  return typeof value === 'string' && value !== '' ? value : undefined
}
