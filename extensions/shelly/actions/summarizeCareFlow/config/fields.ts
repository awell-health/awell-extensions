import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { DISCLAIMER_MSG } from '../../../lib/constants'
import {
  DisclaimerPlacementEnum,
  OptionalDisclaimerTextSchema,
} from '../../../lib/disclaimer'

export type DisclaimerPlacementType = z.infer<typeof DisclaimerPlacementEnum>

export const fields = {
  additionalInstructions: {
    id: 'additionalInstructions',
    label: 'Additional instructions',
    description:
      'Specify additional instructions for summarization, for example format, length, what to focus on etc. If not specified, default instructions will be used.',
    type: FieldType.TEXT,
    required: false,
  },
  stakeholder: {
    id: 'stakeholder',
    label: 'Stakeholder',
    description:
      'Indicates who the summarization is intended for. Defaults to "Clinician"',
    type: FieldType.STRING,
    required: false,
  },
  disclaimerText: {
    id: 'disclaimerText',
    label: 'Disclaimer text',
    description: `Optional action-level disclaimer text override. If not provided, the tenant-level default is used when configured. Otherwise, the action keeps its existing default disclaimer (for example: ${DISCLAIMER_MSG}).`,
    type: FieldType.TEXT,
    required: false,
  },
  disclaimerPlacement: {
    id: 'disclaimerPlacement',
    label: 'Disclaimer placement',
    description:
      'Optional action-level disclaimer placement override. Use top or bottom. If not provided, the tenant-level default is used when configured. Otherwise, Shelly defaults to top.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(DisclaimerPlacementEnum.enum).map(
        (placement) => ({
          label: placement,
          value: placement,
        }),
      ),
    },
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  additionalInstructions: z.string().optional().default(''),
  stakeholder: z
    .string()
    .optional()
    .transform((val): string => {
      if (val === undefined || val === '') return 'Clinician'

      return val
    }),
  disclaimerText: OptionalDisclaimerTextSchema,
  disclaimerPlacement: DisclaimerPlacementEnum.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
