import { AxiosError } from 'axios'

export const isZendeskApiError = (error: unknown): error is AxiosError => {
  return error instanceof AxiosError && error.response !== undefined
}

export const zendeskApiErrorToActivityEvent = (error: AxiosError) => {
  const status = error.response?.status
  const message = (error.response?.data as any)?.error || error.message

  return [
    {
      date: new Date().toISOString(),
      text: { en: `Zendesk API error: ${message}` },
      error: {
        category: (status && status >= 400 && status < 500 ? 'WRONG_INPUT' : 'SERVER_ERROR') as 'WRONG_INPUT' | 'SERVER_ERROR',
        message: message,
      },
    },
  ]
}
