import { isNil } from 'lodash'
import { type ActivityEvent } from '@awell-health/extensions-core'
import { type FieldError } from './gql/sdk'

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
      message: `Message: ${error.message}${
        isNil(error.field) ? '' : `; Field: "${error.field}"`
      }`,
    },
  }))
}
