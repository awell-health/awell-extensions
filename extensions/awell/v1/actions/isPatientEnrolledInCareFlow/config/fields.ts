import { isEmpty, isNil } from 'lodash'
import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'
import { PathwayStatus } from '../../../gql/graphql'

export const fields = {
  pathwayStatus: {
    id: 'pathwayStatus',
    label: 'Pathway status',
    description:
      'A comma-separated string of care flow statuses that will be used when looking for care flows the patient is already enrolled in. By default, we only look at active care flows. Options: "active" "completed", "missing_baseline_info", "starting", and "stopped".',
    type: FieldType.STRING,
    required: false,
  },
  careFlowDefinitionIds: {
    id: 'careFlowDefinitionIds',
    label: 'Care flow definition IDs',
    description:
      'A comma-separated string of care flow definition ids that will be used when looking for care flows the patient is already enrolled in. By default, we only search for care flows that match the current care flow definition id (i.e. is the patient already included in the current care flow?).',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  pathwayStatus: z.optional(
    z
      .string()
      .transform((chars) => chars.replace(/\s/g, '')) // Make sure all white spaces are stripped
      .transform((chars) => chars.split(','))
      .transform((strArray) => {
        const possibleStatuses = Object.values(PathwayStatus)

        return strArray.filter((str) =>
          possibleStatuses.includes(str as PathwayStatus)
        ) as PathwayStatus[]
      })
  ),
  careFlowDefinitionIds: z.optional(
    z
      .string()
      .transform((chars) => chars.replace(/\s/g, '')) // Make sure all white spaces are stripped
      .transform((chars) => chars.split(','))
      .transform((strArray) =>
        strArray.filter((str) => !isNil(str) && !isEmpty(str))
      )
  ),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
