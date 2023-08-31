import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  questionnaireId: {
    id: 'questionnaireId',
    label: 'QuestionnaireId',
    description:
      'Reference to the Canvas Questionnaire using the questionnaire id',
    type: FieldType.STRING,
    required: true,
  },
  subjectId: {
    id: 'subjectId',
    label: 'SubjectId',
    description: 'Reference to the Canvas Patient using the patient id',
    type: FieldType.STRING,
    required: true,
  },
  authored: {
    id: 'authored',
    label: 'Authored',
    description:
      'Timestamp the Questionnaire response was filled out (If omitted the current timestamp at data ingestion will be used)',
    type: FieldType.STRING,
    required: false,
  },
  authorId: {
    id: 'authorId',
    label: 'AuthorId',
    description:
      'Reference to the patient or practitioner filling out the questionnaire. If omitted it will default to Canvas Bot',
    type: FieldType.STRING,
    required: false,
  },
  item: {
    id: 'item',
    label: 'Item',
    description: 'List of answers to questions in the questionnaire',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  questionnaireId: z.string().nonempty({
    message: 'Missing "Questionnaire ID"',
  }),
  subjectId: z.string().nonempty({
    message: 'Missing "Subject ID"',
  }),
  authored: z.string().nonempty({
    message: 'Missing "authored"',
  }),
  authorId: z.string().nonempty({
    message: 'Missing "Author ID"',
  }),
  item: z.string().nonempty({
    message: 'Missing "Item"',
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
