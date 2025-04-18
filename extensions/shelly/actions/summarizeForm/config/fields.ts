import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export enum SummaryFormatEnum {
  BULLET_POINTS = 'Bullet-points',
  TEXT_PARAGRAPH = 'Text paragraph',
}

export const fields = {
  summaryFormat: {
    id: 'summaryFormat',
    label: 'Summary Format',
    description:
      'Format of the summary. Acceptable values are "Bullet-points" and "Text paragraph". Defaults to Bullet-points.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(SummaryFormatEnum).map((format) => ({
        label: format,
        value: format,
      })),
    },
  },
  language: {
    id: 'language',
    label: 'Language',
    description:
      '[Optional] Language of the summarization. Defaults to the language of the form.',
    type: FieldType.STRING,
    required: false,
  },
  additionalInstructions: {
    id: 'additionalInstructions',
    label: 'Additional Instructions',
    description:
      '[Optional] Specify additional instructions for the AI to generate the form summary. You can include details about: specific questions to focus on, desired level of detail, information to emphasize or exclude, etc.',
    type: FieldType.TEXT,
    required: false,
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
        : SummaryFormatEnum.BULLET_POINTS
    ),
  language: z.string().optional().default('Default'),
  additionalInstructions: z.string().optional().default('No additional instructions'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
