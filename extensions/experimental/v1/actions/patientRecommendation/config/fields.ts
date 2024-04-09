import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  title: {
    id: 'title',
    label: 'Title',
    description: 'Descriptive title that is shown on the page',
    type: FieldType.STRING,
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    description:
      'Inform the patient about the recommendation and decision they have to make',
    type: FieldType.HTML,
    required: true,
  },
  acceptRecommendationButtonLabel: {
    id: 'acceptRecommendationButtonLabel',
    label: 'Accept recommendation button label',
    description:
      'The label of the buton to accept the recommendation and redirect the patient to a different page with a deep link',
    type: FieldType.STRING,
    required: true,
  },
  acceptRecommendationDeepLink: {
    id: 'acceptRecommendationDeepLink',
    label: 'Deep link',
    description:
      'The deep link the patient is redirected to when accepting the recommendation',
    type: FieldType.STRING,
    required: true,
  },
  discardRecommendationButtonLabel: {
    id: 'discardRecommendationButtonLabel',
    label: 'Discard recommendation button label',
    description:
      'The label of the button allowing patients to continue and discard the recommendation',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  acceptRecommendationButtonLabel: z.string().min(1),
  acceptRecommendationDeepLink: z.string().min(1),
  discardRecommendationButtonLabel: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
