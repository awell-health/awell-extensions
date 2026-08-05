import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

const DisclaimerPlacementEnum = z.enum(['top', 'bottom'])
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
    description:
      'Optional disclaimer text override. If not provided, the default disclaimer is used.',
    type: FieldType.TEXT,
    required: false,
  },
  disclaimerPlacement: {
    id: 'disclaimerPlacement',
    label: 'Disclaimer placement',
    description:
      'Where to place the disclaimer in the generated summary. Defaults to top.',
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
  disclaimerText: z.preprocess(
    (v) =>
      v === null ||
      v === undefined ||
      (typeof v === 'string' && v.trim() === '')
        ? undefined
        : v,
    z.string().optional(),
  ),
  disclaimerPlacement: DisclaimerPlacementEnum.optional().default('top'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
