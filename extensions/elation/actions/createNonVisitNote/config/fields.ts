import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  // Practice ID is not required so leaving it out for simplicity
  // practiceId: {
  //   id: 'practiceId',
  //   label: 'Practice',
  //   description: 'ID of a Practice',
  //   type: FieldType.NUMERIC,
  //   required: false,
  // },
  authorId: {
    id: 'authorId',
    label: 'Author',
    description: 'The author of a note. Should be the ID of a User in Elation.',
    type: FieldType.NUMERIC,
    required: true,
  },
  category: {
    id: 'category',
    label: 'Category',
    description:
      'The Category of a note, defaults to "Problem". Read the extension documentation for the list of possible values.',
    type: FieldType.STRING,
    required: false,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description: 'Comma-separated list of tags IDs',
    type: FieldType.STRING,
    required: false,
  },
  text: {
    id: 'text',
    label: 'Text',
    description: 'Text of a note',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  authorId: NumericIdSchema,
  tags: z.string().optional(),
  category: z.string().optional(),
  text: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
