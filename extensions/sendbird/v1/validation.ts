import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'
import { type Metadata } from './types'

export const JsonStringValidationSchema = z
  .string()
  .transform((str, ctx): Metadata => {
    if (isNil(str) || isEmpty(str)) return {}

    try {
      const parsedJson = JSON.parse(str)

      if (isEmpty(parsedJson)) {
        return {}
      }

      if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value should represent an object',
        })
        return z.NEVER
      }

      const keys = Object.keys(parsedJson)

      if (keys.some((key) => /(.*,.*)+/.test(key))) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each key of the JSON must not have a comma',
        })
        return z.NEVER
      }

      return parsedJson
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  })

export const MetadataValidationSchema = JsonStringValidationSchema.transform(
  (jsonObject, ctx): Metadata => {
    if (isNil(jsonObject) || isEmpty(jsonObject)) return {}

    try {
      const values = Object.values(jsonObject)

      if (values.length > 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'JSON should have maximum of 5 key-value items',
        })
        return z.NEVER
      }

      if (values.some((val) => typeof val !== 'string')) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value of each JSON key must be a string',
        })
        return z.NEVER
      }

      if (values.some((val) => val.length > 190)) {
        ctx.addIssue({
          code: 'custom',
          message: 'The value of each JSON key must not exceed 190 characters',
        })
        return z.NEVER
      }

      const keys = Object.keys(jsonObject)

      if (keys.some((key) => key.length > 128)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each key of the JSON must not exceed 128 characters',
        })
        return z.NEVER
      }

      return jsonObject
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  }
)

export const CustomFieldsValidationSchema =
  JsonStringValidationSchema.transform((jsonObject, ctx): string => {
    if (isNil(jsonObject) || isEmpty(jsonObject)) return ''

    try {
      const keys = Object.keys(jsonObject)
      const values = Object.values(jsonObject)

      const tooManyKeys = keys.length > 20
      if (tooManyKeys) {
        ctx.addIssue({
          code: 'custom',
          message:
            'The Customer object in Sendbird can only support a maximum of 20 custom fields',
        })
        return z.NEVER
      }

      const keysTooLong = keys.filter((key) => key.length > 20)
      if (keysTooLong.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: `The length of each JSON field's key must not exceed 20 characters. Please fix the following keys: ${keysTooLong.join(
            ', '
          )}`,
        })
        return z.NEVER
      }

      const valuesTooLong = values.filter((val) => val.length > 190)
      if (valuesTooLong.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: `The value of each JSON field must not exceed 190 characters. Please fix the following values: ${valuesTooLong.join(
            ', '
          )}`,
        })
        return z.NEVER
      }

      return JSON.stringify(jsonObject)
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  })
