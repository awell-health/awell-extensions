import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { type BaselineInfoInput } from '../../../gql/graphql'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  pathwayDefinitionId: {
    id: 'pathwayDefinitionId',
    label: 'Care flow definition ID',
    description: 'The identifier of the care flow definition to start.',
    type: FieldType.STRING,
    required: true,
  },
  baselineInfo: {
    id: 'baselineInfo',
    label: 'Baseline info',
    description:
      'Use baseline info to pass values for data points when starting a care flow. This needs to be an array of objects, please read the documentation for more info.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  pathwayDefinitionId: z.string(),
  baselineInfo: z
    .optional(z.string())
    .transform((str, ctx): BaselineInfoInput[] | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return undefined
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
