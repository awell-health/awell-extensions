import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { DISCLAIMER_MSG_FORM } from '../../../lib/constants'
import {
  DisclaimerPlacementEnum,
  OptionalDisclaimerTextSchema,
} from '../../../lib/disclaimer'

// Step 1: Define the enum
export enum SummaryFormatEnum {
  BULLET_POINTS = 'Bullet-points',
  TEXT_PARAGRAPH = 'Text paragraph',
}

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
    description: `Optional action-level disclaimer text override. If not provided, the tenant-level default is used when configured. Otherwise, the action keeps its existing default disclaimer (for example: ${DISCLAIMER_MSG_FORM}).`,
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
  disclaimerText: OptionalDisclaimerTextSchema,
  disclaimerPlacement: DisclaimerPlacementEnum.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
