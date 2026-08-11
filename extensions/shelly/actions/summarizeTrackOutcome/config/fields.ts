import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { DISCLAIMER_MSG } from '../../../lib/constants'
import {
  DisclaimerPlacementEnum,
  OptionalDisclaimerTextSchema,
} from '../../../lib/disclaimer'

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
  instructions: z.string().optional().default(''),
  disclaimerText: OptionalDisclaimerTextSchema,
  disclaimerPlacement: DisclaimerPlacementEnum.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
