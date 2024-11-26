import {
  Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

/**
 * Available Templates
 *
 * The action currently supports only the "Complete H&P (1 col)" template.
 *
 * For a complete list of available templates and their descriptions, refer to the external documentation:
 * https://docs.elationhealth.com/reference/the-visit-note-object#allowed-values
 */
export const templateType = z.enum(['Complete H&P (1 col)'])

/**
 * Available Bullet Categories
 *
 * The action currently supports only the "ROS" (Review of Systems) bullet category.
 *
 * For a complete list of bullet categories and their descriptions, refer to the external documentation:
 * https://docs.elationhealth.com/reference/the-visit-note-object#allowed-values
 */
export const bulletCategory = z.enum(['ROS'])

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  template: {
    id: 'template',
    label: 'Template',
    description:
      'Visit note template. Currently we only support Complete H&P (1 col).',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(templateType.enum).map((template) => ({
        label: template,
        value: template,
      })),
    },
  },
  category: {
    id: 'category',
    label: 'Category',
    description: 'Bullet category. Currently we only support ROS.',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(bulletCategory.enum).map((category) => ({
        label: category,
        value: category,
      })),
    },
  },
  physicianId: {
    id: 'physicianId',
    label: 'Physician ID',
    description: 'Prescribing physician ID',
    type: FieldType.NUMERIC,
    required: true,
  },
  authorId: {
    id: 'authorId',
    label: 'Author',
    description: 'The author of a note. Should be the ID of a User in Elation.',
    type: FieldType.NUMERIC,
    required: true,
  },
  text: {
    id: 'text',
    label: 'Text',
    description: 'Text of a note',
    type: FieldType.TEXT,
    required: true,
  },
  type: {
    id: 'type',
    label: 'Type',
    description: 'Type of visit note. Defaults to Office Visit Note.',
    type: FieldType.STRING,
    required: false,
  },
  confidential: {
    id: 'confidential',
    label: 'Confidential',
    description:
      'Whether this note is confidential to the practice and shouldn`t be shared automatically with third parties. Defaults to false.',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  template: templateType,
  category: bulletCategory,
  physicianId: NumericIdSchema,
  authorId: NumericIdSchema,
  text: z.string(),
  type: z.string().optional(),
  confidential: z.boolean().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
