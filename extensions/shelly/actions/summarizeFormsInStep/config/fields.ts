import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

// Step 1: Define the enum
export enum SummaryFormatEnum {
  BULLET_POINTS = 'Bullet-points',
  TEXT_PARAGRAPH = 'Text paragraph',
}

const DisclaimerPlacementEnum = z.enum(['top', 'bottom'])
export type DisclaimerPlacementType = z.infer<typeof DisclaimerPlacementEnum>

// Step 2: Define the fields object
export const fields = {
  summaryFormat: {
    id: 'summaryFormat',
    label: 'Summary Format',
    description:
      'Specify the format of the summary. Acceptable values are "Bullet-points" and "Text paragraph". Defaults to Bullet-points.',
    type: FieldType.STRING,
    required: false,
  },
  language: {
    id: 'language',
    label: 'Language',
    description:
      '[Optional] Indicates the language of the summarization. Defaults to the language of the form.',
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

// Step 3: Define the validation schema using zod
export const FieldsValidationSchema = z.object({
  summaryFormat: z
    .enum([SummaryFormatEnum.BULLET_POINTS, SummaryFormatEnum.TEXT_PARAGRAPH])
    .optional()
    .default(SummaryFormatEnum.BULLET_POINTS)
    .transform((value) =>
      Object.values(SummaryFormatEnum).includes(value as SummaryFormatEnum)
        ? value
        : SummaryFormatEnum.BULLET_POINTS,
    ),
  language: z.string().optional().default('Default'),
  disclaimerText: z.string().optional(),
  disclaimerPlacement: DisclaimerPlacementEnum.optional().default('top'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
