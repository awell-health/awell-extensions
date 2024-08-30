import { type ActivityEvent } from '@awell-health/extensions-core'

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
