import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  language: {
    id: 'language',
    label: 'language',
    description: 'The language the survey was completed in.',
    type: FieldType.STRING,
    required: true,
  },
  adminDate: {
    id: 'adminDate',
    label: 'Administration Date',
    description: 'The date the survey was completed in YYYY-MM-DD format.',
    type: FieldType.DATE,
    required: true,
  },
  thirdPartyIdentifier: {
    id: 'thirdPartyIdentifier',
    label: 'Third Party Identifier',
    description:
      'The (external) identifier for the user for whom the survey was completed.',
    type: FieldType.STRING,
    required: true,
  },
  gender: {
    id: 'gender',
    label: 'Gender',
    description: 'The gender of the user for whom the survey was completed.',
    type: FieldType.STRING,
    required: true,
  },
  age: {
    id: 'age',
    label: 'Age',
    description: 'The age of the user for whom the survey was completed.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa1: {
    id: 'pa1',
    label: 'PA 1',
    description: 'The answer to PA 1.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa2: {
    id: 'pa2',
    label: 'PA 2',
    description: 'The answer to PA 2.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa3: {
    id: 'pa3',
    label: 'PA 3',
    description: 'The answer to PA 3.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa4: {
    id: 'pa4',
    label: 'PA 4',
    description: 'The answer to PA 4.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa5: {
    id: 'pa5',
    label: 'PA 5',
    description: 'The answer to PA 5.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa6: {
    id: 'pa6',
    label: 'PA 6',
    description: 'The answer to PA 6.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa7: {
    id: 'pa7',
    label: 'PA 7',
    description: 'The answer to PA 7.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa8: {
    id: 'pa8',
    label: 'PA 8',
    description: 'The answer to PA 8.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa9: {
    id: 'pa9',
    label: 'PA 9',
    description: 'The answer to PA 9.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa10: {
    id: 'pa10',
    label: 'PA 10',
    description: 'The answer to PA 10.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa11: {
    id: 'pa11',
    label: 'PA 11',
    description: 'The answer to PA 11.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa12: {
    id: 'pa12',
    label: 'PA 12',
    description: 'The answer to PA 12.',
    type: FieldType.NUMERIC,
    required: true,
  },
  pa13: {
    id: 'pa13',
    label: 'PA 13',
    description: 'The answer to PA 13.',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  language: z.string(),
  adminDate: z
    .string({
      errorMap: () => ({
        message: 'Admin date is required and must be of format YYYY-MM-DD',
      }),
    })
    .datetime(),
  thirdPartyIdentifier: z.string(),
  gender: z.string(),
  age: z.number(),
  pa1: z.number(),
  pa2: z.number(),
  pa3: z.number(),
  pa4: z.number(),
  pa5: z.number(),
  pa6: z.number(),
  pa7: z.number(),
  pa8: z.number(),
  pa9: z.number(),
  pa10: z.number(),
  pa11: z.number(),
  pa12: z.number(),
  pa13: z.number(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
