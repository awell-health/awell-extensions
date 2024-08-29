import { type ActivityEvent } from '@awell-health/extensions-core'
import { type AxiosError } from 'axios'

type SalesforceError = Array<{
  message: string
  errorCode: string
}>

export const isSalesforceError = (
  error: any
): error is AxiosError<SalesforceError> => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    Array.isArray(error.response.data) &&
    error.response.data.length > 0 &&
    'errorCode' in error.response.data[0] &&
    'message' in error.response.data[0]
  )
}

export const parseSalesforceError = (
  error: AxiosError<SalesforceError>
): ActivityEvent => {
  const category = 'BAD_REQUEST'
  const salesforceError = error?.response?.data[0]
  const message = `${String(salesforceError?.errorCode)}: ${String(
    salesforceError?.message
  )}`

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
