import { AxiosError } from 'axios'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const isZodError = (error: any): boolean => {
  return error instanceof ZodError
}

export const isAxiosError = (error: any): boolean => {
  return error instanceof AxiosError
}

export const parseZodError = (error: any): any => {
  const parsedError = fromZodError(error)
  return {
    date: new Date().toISOString(),
    text: { en: parsedError.message },
    error: {
      category: 'SERVER_ERROR',
      message: parsedError.message,
    },
  }
}

export const parseAxiosError = (error: AxiosError): any => {
  return {
    date: new Date().toISOString(),
    text: {
      en: `${error.status ?? '(no status code)'} Error: ${error.message}`,
    },
    error: {
      category: 'BAD_REQUEST',
      message: `${error.status ?? '(no status code)'} Error: ${error.message}`,
    },
  }
}

export const parseUnknowError = (error: Error): any => {
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
