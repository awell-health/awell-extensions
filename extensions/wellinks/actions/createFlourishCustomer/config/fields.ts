import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  firstName: {
    id: 'firstName',
    label: 'First Name',
    description: 'The first name of the user to create in Flourish.',
    type: FieldType.STRING,
    required: true,
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    description: 'The last name of the user to create in Flourish.',
    type: FieldType.STRING,
    required: true,
  },
  dateOfBirth: {
    id: 'dateOfBirth',
    label: 'Date of Birth',
    description:
      'The date of birth of the user to create in Flourish in YYYY-MM-DD format.',
    type: FieldType.DATE,
    required: true,
  },
  subgroupId: {
    id: 'subgroupId',
    label: 'Subgroup ID',
    description: 'The subgroup ID of the user to create in Flourish.',
    type: FieldType.STRING,
    required: true,
  },
  thirdPartyIdentifier: {
    id: 'thirdPartyIdentifier',
    label: 'Third Party Identifier',
    description:
      'The third party identifier of the user to create in Flourish.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z
    .string({
      errorMap: () => ({
        message: 'Admin date is required and must be of format YYYY-MM-DD',
      }),
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  subgroupId: z.string(),
  thirdPartyIdentifier: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
