import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { GenderSchema } from '../../../../../src/lib/fhir/schemas/Patient'
import { startCase } from 'lodash'
import { optionalEmailSchema } from '../../../../../src/utils/emailValidation'

export const fields = {
  assigningOrganizationId: {
    id: 'assigningOrganizationId',
    label: 'Assigning organization ID',
    type: FieldType.STRING,
    description: 'The ID of the organization that is creating the patient.',
    required: true,
  },
  ssn: {
    id: 'ssn',
    label: 'SSN',
    type: FieldType.STRING,
    description: 'The patient’s Social Security Number.',
    required: false,
  },
  familyName: {
    id: 'familyName',
    label: 'Family name',
    type: FieldType.STRING,
    description: 'The patient’s family (last) name.',
    required: true,
  },
  givenName: {
    id: 'givenName',
    label: 'Given name',
    type: FieldType.STRING,
    description:
      "The patient's given name. May include first and middle names.",
    required: true,
  },
  birthDate: {
    id: 'birthDate',
    label: 'Birth date',
    type: FieldType.DATE,
    required: false,
  },
  gender: {
    id: 'gender',
    label: 'Gender',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: GenderSchema._def.values.map((value) => ({
        value,
        label: startCase(value),
      })),
    },
  },
  email: {
    id: 'email',
    label: 'Email',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  assigningOrganizationId: z.string().min(1),
  ssn: z
    .string()
    .regex(
      /^\d{3}-\d{2}-\d{4}$/,
      'Invalid SSN format. Must be in the format xxx-xx-xxxx',
    )
    .optional(),
  familyName: z.string().min(1),
  givenName: z.string().min(1),
  birthDate: z.coerce.date().optional(),
  gender: GenderSchema.optional(),
  email: optionalEmailSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
