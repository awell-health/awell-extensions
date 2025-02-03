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
  resolvingDocument: {
    id: 'resolvingDocument',
    label: 'Resolving document',
    type: FieldType.NUMERIC,
    required: true,
    description:
      'The ID of the document that resolves the referral order. Can be f.e. a reference to a non-visit note. Required if the resolution state is "fulfilled".',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  referralOrderId: NumericIdSchema,
  resolutionState: ResolutionStateSchema,
  // Making it optional as making it required would break the extension for existing workflows
  // I'll make it required once we've updated the Suvida flows
  resolvingDocument: NumericIdSchema.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
