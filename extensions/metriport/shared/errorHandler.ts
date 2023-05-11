import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import { AxiosError } from 'axios'
import { type OnErrorCallback } from '../../../lib/types'

export const handleErrorMessage = async (
  err: any,
  onError: OnErrorCallback
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
  } else if (err instanceof AxiosError) {
    await onError({
      events: [
        {
          date: new Date().toISOString(),
          text: {
            en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
          },
          error: {
            category: 'SERVER_ERROR',
            message: `${err.status ?? '(no status code)'} Error: ${
              err.message
            }`,
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
