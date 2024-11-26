import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { formatISO } from 'date-fns'
import { Sex } from '../../../gql/graphql'
import { E164PhoneValidationOptionalSchema } from '@awell-health/extensions-core'

const SexEnum = z.enum([Sex.Female, Sex.Male, Sex.NotKnown])

export const fields = {
  patientCode: {
    id: 'patientCode',
    label: 'Patient code',
    type: FieldType.STRING,
    required: false,
  },
  firstName: {
    id: 'firstName',
    label: 'First name',
    type: FieldType.STRING,
    required: false,
  },
  lastName: {
    id: 'lastName',
    label: 'Last name',
    type: FieldType.STRING,
    required: false,
  },
  email: {
    id: 'email',
    label: 'Email',
    type: FieldType.STRING,
    /**
     * I am purposely not using the `email` stringType yet.
     * More information here: https://awellhealth.atlassian.net/jira/polaris/projects/AH/ideas/view/548618?selectedIssue=AH-176&issueViewLayout=sidebar&issueViewSection=capture&focusedInsightId=3144292
     */
    // stringType: StringType.EMAIL,
    required: false,
  },
  birthDate: {
    id: 'birthDate',
    label: 'Birth date',
    type: FieldType.DATE,
    required: false,
  },
  mobilePhone: {
    id: 'mobilePhone',
    label: 'Mobile phone',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
  },
  phone: {
    id: 'phone',
    label: 'Phone',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
  },
  preferredLanguage: {
    id: 'preferredLanguage',
    label: 'Preferred language',
    type: FieldType.STRING,
    required: false,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description: 'Sex code as defined by ISO standard IEC_5218',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(SexEnum.enum).map((sex) => ({
        label: sex,
        value: sex,
      })),
    },
  },
  city: {
    id: 'city',
    label: 'City',
    type: FieldType.STRING,
    required: false,
  },
  country: {
    id: 'country',
    label: 'Country',
    type: FieldType.STRING,
    required: false,
  },
  state: {
    id: 'state',
    label: 'State',
    type: FieldType.STRING,
    required: false,
  },
  street: {
    id: 'street',
    label: 'Street',
    type: FieldType.STRING,
    required: false,
  },
  zip: {
    id: 'zip',
    label: 'ZIP',
    type: FieldType.STRING,
    required: false,
  },
  nationalRegistryNumber: {
    id: 'nationalRegistryNumber',
    label: 'National registry number',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientCode: z.optional(z.string().trim().nonempty()),
  firstName: z.optional(z.string().trim()),
  lastName: z.optional(z.string().trim()),
  birthDate: z.optional(z.coerce.date().transform((date) => formatISO(date))),
  email: z.optional(
    z.string().trim().email('Value passed is not an email address')
  ),
  phone: E164PhoneValidationOptionalSchema,
  mobilePhone: E164PhoneValidationOptionalSchema,
  street: z.optional(z.string().trim()),
  state: z.optional(z.string().trim()),
  country: z.optional(z.string().trim()),
  city: z.optional(z.string().trim()),
  zip: z.optional(z.string().trim()),
  preferredLanguage: z.optional(z.string().trim()),
  sex: z.optional(z.preprocess((v) => String(v).toUpperCase(), SexEnum)),
  nationalRegistryNumber: z.string().trim().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
