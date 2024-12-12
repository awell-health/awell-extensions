import { isEmpty, isNil } from 'lodash'
import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'
import { PathwayStatus } from '../../../gql/graphql'

export const fields = {
  pathwayStatus: {
    id: 'pathwayStatus',
    label: 'Pathway status',
    description: `A comma-separated string of care flow statuses that will be used when looking for care flows the patient is already enrolled in. By default, we only look at active care flows. Possible values are: ${Object.values(
      PathwayStatus
    ).join(', ')}.`,
    type: FieldType.STRING,
    required: false,
    /**
     * We currently do not support multi-select options for dropdown fields.
     * Hence why we're not using this and rely on the user to enter a comma-separated string of statuses.
     * This is a temporary solution and we should revisit this when we have multi-select options for dropdown fields.
     * See ET-602 and ET-603 for more information.
     */
    // options: {
    //   dropdownOptions: Object.values(PathwayStatus).map((status) => ({
    //     label: capitalize(status.replace('_', ' ')),
    //     value: status,
    //   })),
    // },
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
