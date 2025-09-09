import { isAxiosError } from 'axios'

export const parseZendeskError = (err: unknown): string => {
  if (isAxiosError(err)) {
    const data = err.response?.data as any
    const message = data?.message ?? data?.error ?? err.message
    return `Zendesk API error: ${message}`
  }
  return 'Unknown error'
}
