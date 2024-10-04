import {
  type Fields,
  type DataPointDefinition,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { z } from 'zod'

export const fields = {
  flowId: {
    id: 'flowId',
    label: 'Flow ID',
    type: FieldType.STRING,
    required: true,
    description: 'The ID of the flow to use for the call.',
  },
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone Number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
    description: 'The phone number to call.',
  },
  data: {
    id: 'data',
    label: 'Data',
    type: FieldType.JSON,
    required: true,
    description: 'Any additional data to be passed to the call.',
  },
} satisfies Fields

export const dataPoints = {} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  flowId: z.string(),
  phoneNumber: z.string(),
  data: z.record(z.any()),
})
export type ActionFields = z.infer<typeof FieldsSchema>
