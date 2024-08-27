import { type ActivityEvent } from '@awell-health/extensions-core'
import { fromZodError } from 'zod-validation-error'

export interface TwilioErrorResponse {
  code: number
  message: string
  moreInfo: string
  status: number
}

export const isTwilioErrorResponse = (
  data: any
): data is TwilioErrorResponse => {
  return typeof data?.moreInfo === 'string'
}

export const parseTwilioError = (error: TwilioErrorResponse): ActivityEvent => {
  const category = 'BAD_REQUEST'
  const message = `${error.code}: ${error.message} (${error.moreInfo})`

  return {
    date: new Date().toISOString(),
    text: {
      en: message,
    },
    error: {
      category,
      message,
    },
  }
}

export const parseUnknowError = (error: Error): ActivityEvent => {
  const message = error.message
  return {
    date: new Date().toISOString(),
    text: { en: message },
    error: {
      category: 'SERVER_ERROR',
      message,
    },
  }
}

export const parseZodError = (error: any): ActivityEvent => {
  const parsedError = fromZodError(error)
  return {
    date: new Date().toISOString(),
    text: { en: parsedError.message },
    error: {
      category: 'BAD_REQUEST',
      message: parsedError.message,
    },
  }
}
