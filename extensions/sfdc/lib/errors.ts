import { ActivityEvent } from '@awell-health/extensions-core'
import { AxiosError } from 'axios'

export const parseAxiosError = (error: AxiosError): ActivityEvent => {
  const category = 'BAD_REQUEST'
  let message = `${error?.response?.status?.toString() ?? 'UNKNOWN_STATUS'}: ${
    error.message
  }`

  // Check if it's a Salesforce error
  if (
    Array.isArray(error?.response?.data) &&
    error?.response?.data[0]?.errorCode &&
    error?.response?.data[0]?.message
  ) {
    const salesforceError = error?.response?.data[0]
    message = `${salesforceError.errorCode}: ${salesforceError.message}`
  }

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
