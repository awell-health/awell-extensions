import { isNil, keys } from 'lodash'
import { type ActivityEvent } from '@awell-health/extensions-core'
import { type FieldError } from './gql/sdk'
import { type Response } from 'graphql-request/dist/types'

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
