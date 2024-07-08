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

export const formatErrors = (
  error?: unknown | Error 
): any => {
  if (error instanceof ZodError) {
    const err = fromZodError(error)
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
  if (error instanceof HealthieError) {
    const errors = mapHealthieToActivityError(error.errors)
    return {
      events: errors,
    }
  }
  const err = error as Error
  return {
    events: [
      {
        date: new Date().toISOString(),
        text: { en: 'Unable to process the webhook' },
        error: {
          category: 'SERVER_ERROR',
          message: err.message ?? 'Unable to process the webhook',
        },
      }
    ]
  }
}

