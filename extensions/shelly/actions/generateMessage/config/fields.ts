import { type Field, FieldType } from '@awell-health/extensions-core';
import z, { type ZodTypeAny } from 'zod';

/**
 * Fields definitions for the message form.
 */
export const fields = {
  communicationObjective: {
    id: 'communicationObjective',
    label: 'Communication Objective',
    description:
      'Provide the main purpose of the message. Add any important message context.',
    type: FieldType.STRING,
    required: true,
  },
  personalizationInput: {
    id: 'personalizationInput',
    label: 'Personalization Input',
    description:
      '[Optional] Specify the personalization input for the message (name, age, gender, date of the last checkup, etc). This is used to personalize the message to the recipient.',
    type: FieldType.STRING,
    required: false,
  },
  stakeholder: {
    id: 'stakeholder',
    label: 'Stakeholder',
    description:
      '[Optional]Specify the recipient role; defaults to "Patient." Used for personalization.',
    type: FieldType.STRING,
    required: false,
  },
  language: {
    id: 'language',
    label: 'Language',
    description: '[Optional]Specify the language of the message; defaults to English.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>;

/**
 * Validation schema for the fields using Zod.
 */
const fieldSchemas = {
  communicationObjective: z.string().min(1, 'Communication objective is required'),
  personalizationInput: z.string().optional().default(''),
  stakeholder: z
    .string()
    .optional()
    .transform((val): string => {
      if (val === undefined || val === '') return 'Patient';
      return val;
    }),
  language: z
    .string()
    .optional()
    .transform((val): string => {
      if (val === undefined || val === '') return 'English';
      return val;
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>;

export const FieldsValidationSchema = z.object(fieldSchemas);
