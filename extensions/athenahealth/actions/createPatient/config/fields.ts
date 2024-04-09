import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { AwellToAthenaDateOnlySchema } from '../../../validation/date'

export const fields = {
  departmentid: {
    id: 'departmentid',
    label: 'Department ID',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  firstname: {
    id: 'firstname',
    label: 'First name',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  lastname: {
    id: 'lastname',
    label: 'Last name',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  dob: {
    id: 'dob',
    label: 'Date of birth',
    description: '',
    type: FieldType.DATE,
    required: true,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  departmentid: z.string().min(1),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  dob: AwellToAthenaDateOnlySchema,
  email: z.string().min(1).email(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export type CreatePatientInputType = z.infer<typeof FieldsValidationSchema>
