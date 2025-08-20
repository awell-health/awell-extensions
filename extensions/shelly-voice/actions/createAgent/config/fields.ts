import { z } from 'zod'
import { Field, FieldType } from '@awell-health/extensions-core'

export const fields: Record<string, Field> = {
  voice: {
    id: 'voice',
    label: 'Voice',
    type: FieldType.STRING,
    required: true,
  },
  language: {
    id: 'language',
    label: 'Language',
    type: FieldType.STRING,
    required: true,
  },
  personality: {
    id: 'personality',
    label: 'Personality',
    type: FieldType.STRING,
    required: true,
  },
}

export const FieldsValidationSchema = z.object({
  voice: z.string().min(1),
  language: z.string().min(1),
  personality: z.string().min(1),
})
