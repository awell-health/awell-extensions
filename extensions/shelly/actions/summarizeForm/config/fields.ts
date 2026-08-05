import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export enum SummaryFormatEnum {
  BULLET_POINTS = 'Bullet-points',
  TEXT_PARAGRAPH = 'Text paragraph',
}

const DisclaimerPlacementEnum = z.enum(['top', 'bottom'])
export type DisclaimerPlacementType = z.infer<typeof DisclaimerPlacementEnum>

const ScopeEnum = z.enum(['Step', 'Track'])
export type ScopeType = z.infer<typeof ScopeEnum>

const FormSelectionEnum = z.enum(['Latest', 'All'])
export type FormSelectionType = z.infer<typeof FormSelectionEnum>

export const fields = {
  scope: {
    id: 'scope',
    label: 'Scope',
    description:
      'The scope in which to look for forms. Default is "Step" (current step only).',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(ScopeEnum.enum).map((scope) => ({
        label: scope,
        value: scope,
      })),
    },
  },
  formSelection: {
    id: 'formSelection',
    label: 'Form selection',
    description:
      'Whether to summarize the most recent form or all forms in the scope. Default is "Latest".',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(FormSelectionEnum.enum).map(
        (selection) => ({
          label: selection,
          value: selection,
        }),
      ),
    },
  },
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
  scope: ScopeEnum.default('Step'),
  formSelection: FormSelectionEnum.default('Latest'),
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
  additionalInstructions: z
    .string()
    .optional()
    .default('No additional instructions'),
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
