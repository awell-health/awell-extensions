import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'
import { ResolutionStateSchema } from '../../../validation/referralOrder.zod'
import { startCase } from 'lodash'

export const fields = {
  referralOrderId: {
    id: 'referralOrderId',
    label: 'Referral Order ID',
    type: FieldType.NUMERIC,
    required: true,
  },
  resolutionState: {
    id: 'resolutionState',
    label: 'Resolution state',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(ResolutionStateSchema.enum).map(
        (resolution) => ({
          label: startCase(resolution),
          value: resolution,
        }),
      ),
    },
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referralOrderId: NumericIdSchema,
  resolutionState: ResolutionStateSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
