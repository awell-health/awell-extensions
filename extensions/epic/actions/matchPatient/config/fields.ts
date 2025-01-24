import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { GenderSchema } from '../../../../../src/lib/fhir/schemas/Patient'
import { startCase } from 'lodash'

export const fields = {
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
    required: true,
  },
  gender: {
    id: 'gender',
    label: 'Gender',
    type: FieldType.STRING,
    required: true,
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
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  familyName: z.string().min(1),
  givenName: z.string().min(1),
  birthDate: z.coerce.date(),
  gender: GenderSchema,
  email: z.string().email().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
