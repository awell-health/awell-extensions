import {
  Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

// Available templates: "Simple", "SOAP", "Complete H&P (1 col)", "Complete H&P (2 col)", "Complete H&P (2 col A/P)", "Pre-Op"
// but for now we only want to support Complete H&P (1 col)
export const templateType = z.enum(['Complete H&P (1 col)'])

// Available buttle categories: "Problem", "Past", "Family", "Social", "Instr", "PE", "ROS", "Med", "Data", "Assessment", "Test", "Tx", "Narrative", "Followup", "Reason", "Plan", "Objective", "Hpi", "Allergies", "Habits", "Assessplan", "Consultant", "Attending", "Dateprocedure", "Surgical", "Orders", "Referenced", "Procedure"
// we only need to support ROSS for now
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
  },
  category: {
    id: 'category',
    label: 'Category',
    description: 'Bullet category. Currently we only support ROS.',
    type: FieldType.STRING,
    required: true,
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
