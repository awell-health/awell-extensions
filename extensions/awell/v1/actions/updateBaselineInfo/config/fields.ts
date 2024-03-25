import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { type BaselineInfoInput } from '../../../gql/graphql'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  baselineInfo: {
    id: 'baselineInfo',
    label: 'Baseline info',
    description:
      'Use baseline data points often used to start a care flow. Must be an array of objects<{value, data_point_definition_id}>.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  baselineInfo: z
    .optional(z.string())
    .transform((str, ctx): BaselineInfoInput[] => {
      try {
        if (isNil(str) || isEmpty(str)) {
          ctx.addIssue({
            code: 'custom',
            message: `Baseline info cannot be empty. It must be an array of data_point_definition_id and value pairs.`,
          })
          return z.NEVER
        }
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: `Baseline info should be an array. Your parsed baselineInfo field is currently empty.`,
          })
          return z.NEVER
        }

        if (!Array.isArray(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: `Baseline info should be an array, it's currently a ${typeof parsedJson}.`,
          })
          return z.NEVER
        }

        const allObjectsHaveKeys = parsedJson.every((obj) => {
          if (typeof obj !== 'object') {
            ctx.addIssue({
              code: 'custom',
              message: `Item "${String(
                obj
              )}" in baseline info array is not an object.`,
            })
            return z.NEVER
          }

          return 'data_point_definition_id' in obj && 'value' in obj
        })

        const allObjectValuesAreStrings = parsedJson.every((obj) => {
          return Object.values(obj).every((v) => typeof v === 'string')
        })

        if (!allObjectsHaveKeys) {
          ctx.addIssue({
            code: 'custom',
            message:
              'Every object in the baseline info array should (only) have a `data_point_definition_id` and `value` field.',
          })
          return z.NEVER
        }

        if (!allObjectValuesAreStrings) {
          ctx.addIssue({
            code: 'custom',
            message:
              'Not all baseline info values are strings. Given data point values are polymorphic, the value for a data point should always be sent as a string.',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON.' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
