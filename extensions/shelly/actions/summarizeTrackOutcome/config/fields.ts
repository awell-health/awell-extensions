import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

const DisclaimerPlacementEnum = z.enum(['top', 'bottom'])
export type DisclaimerPlacementType = z.infer<typeof DisclaimerPlacementEnum>

export const fields = {
  instructions: {
    id: 'instructions',
    label: 'Instructions',
    description:
      'Specify instructions for the AI to generate the track outcome summary. You can include details about: what outcome to focus on, where to find it in the track, specific forms to analyze, desired length and format, parts of the track to exclude, level of detail for decision paths, etc.',
    type: FieldType.TEXT,
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
  instructions: z.string().optional().default(''),
  disclaimerText: z.string().optional(),
  disclaimerPlacement: DisclaimerPlacementEnum.optional().default('top'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
