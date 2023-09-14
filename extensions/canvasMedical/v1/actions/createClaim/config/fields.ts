import {
  DateOnlySchema,
  FieldType,
  type Field,
} from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { JsonArraySchema, JsonSchema } from '../../../validation'

// Note: https://docs.canvasmedical.com/reference/claim-create
export const fields = {
  status: {
    id: 'status',
    label: 'Status',
    description:
      'Accepts a value representing the status compliant with Canvas Medical.',
    type: FieldType.STRING,
    required: true,
  },
  type: {
    id: 'type',
    label: 'Type',
    description:
      'Accepts a JSON object representing the type compliant with Canvas Medical.',
    type: FieldType.JSON,
    required: true,
  },
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: `The patient's unique resource ID (e.g. 865058f6654149bd921264d91519af9e).`,
    type: FieldType.STRING,
    required: true,
  },
  created: {
    id: 'created',
    label: 'Created',
    description: 'The field indicating when this claim resource was created.',
    type: FieldType.DATE,
    required: true,
  },
  provider: {
    id: 'provider',
    label: 'Provider',
    description:
      'The field related to determining personnel resources for services in the statement accepts a JSON object in accordance with the Canvas Medical format.',
    type: FieldType.JSON,
    required: true,
  },
  supportingInfo: {
    id: 'supportingInfo',
    label: 'Supporting Info',
    description:
      'Accepts a value representing the supporting info compliant with Canvas Medical.',
    type: FieldType.JSON,
    required: false,
  },
  diagnosis: {
    id: 'diagnosis',
    label: 'Diagnosis',
    description:
      'The field represents the list will create the Assessments in Canvas for this claim and accepts an array of JSON objects.',
    type: FieldType.JSON,
    required: true,
  },
  insurance: {
    id: 'insurance',
    label: 'Insurance',
    description:
      'The field represents the list of elements that defines what coverages are to be used when adjudicating the claim and accepts an array of JSON objects.',
    type: FieldType.JSON,
    required: true,
  },
  item: {
    id: 'item',
    label: 'Item',
    description:
      'The field represents the list of service charges to be used in the claim and accepts an array of JSON objects.',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  status: z.string(),
  type: JsonSchema,
  patientId: z.string(),
  created: DateOnlySchema,
  provider: JsonSchema,
  supportingInfo: JsonArraySchema.optional(),
  diagnosis: JsonArraySchema,
  insurance: JsonArraySchema,
  item: JsonArraySchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
