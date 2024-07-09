import { isNil, keys } from 'lodash'
import { type ActivityEvent } from '@awell-health/extensions-core'
import { type FieldError } from './generated/sdk'
import { type Response } from 'graphql-request/dist/types'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class HealthieError extends Error {
  errors: FieldError[]

  constructor(errors: FieldError[]) {
    super(
      'Error in Healthie: invalid object name or field, or a record is not found.'
    )
    this.name = 'HealthieError'
    this.errors = errors
  }
}

export const getHealthieErrorFromResponse = (
  response: Response<unknown> | Error
): FieldError[] | undefined => {
  if (response instanceof Error) {
    return [{ message: response.message }]
  }

  const dataKeys = keys(response?.data)
  for (const key of dataKeys) {
    const messages = (
      response?.data as Record<string, { messages?: FieldError[] }>
    )[key]?.messages

    if (!isNil(messages) && messages.length > 0) {
      return messages
    }
  }

  return undefined
}

export const mapHealthieToActivityError = (
  errors?: Array<FieldError | null>
): ActivityEvent[] => {
  if (isNil(errors)) return []
  const nonNullErrors = errors.filter((value) => !isNil(value)) as FieldError[]

  return nonNullErrors.map((error) => ({
    date: new Date().toISOString(),
    text: { en: 'Healthie API reported an error' },
    error: {
      category: 'SERVER_ERROR',
      message: `${
        isNil(error.field) ? 'Message: ' : `Field "${error.field}": `
      }${error.message};`,
    },
  }))
}

export const formatError = (
  error?: unknown | Error 
): any => {
  switch (true) {
    case (error instanceof ZodError): {
      const err = fromZodError(error as ZodError)
      return {
        events: [
          {
            date: new Date().toISOString(),
            text: { en: err.name },
            error: {
              category: 'WRONG_INPUT',
              message: `${err.message}`,
            },
          },
        ],
      }
    }
    case (error instanceof HealthieError): {
      const errors = mapHealthieToActivityError((error as HealthieError).errors)
      return {
        events: errors,
      }
    }
    default: {
      const err = error as Error
      const errMessage = err.message ?? 'Unable to process the webhook'
      return {
        events: [
          {
            date: new Date().toISOString(),
            text: { en: errMessage },
            error: {
              category: 'SERVER_ERROR',
              message: errMessage,
            },
          }
        ]
      }
    }
  }
}

