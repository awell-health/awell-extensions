import {
  DateOnlySchema,
  FieldType,
  type Field,
} from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import {
  createReferenceSchema,
  JsonArraySchema,
  JsonSchema,
} from '../../../validation'

export const fields = {
  id: {
    id: 'id',
    label: 'Coverage ID',
    description: `The coverage's unique ID.`,
    type: FieldType.STRING,
    required: true,
  },
  order: {
    id: 'order',
    label: 'Order',
    description:
      'A numerical value from 1 to 5, representing the order in which insurance coverages should be used when processing claims.',
    type: FieldType.NUMERIC,
    required: true,
  },
  status: {
    id: 'status',
    label: 'Status',
    description: 'The status of the coverage.',
    type: FieldType.STRING,
    required: true,
  },
  type: {
    id: 'type',
    label: 'Type',
    description: `The Insurance Coverage Code Category, such as medical or accident, using values from http://hl7.org/fhir/ValueSet/coverage-type.`,
    type: FieldType.JSON,
    required: false,
  },
  subscriber: {
    id: 'subscriber',
    label: 'Subscriber',
    description: `The resource for the subscriber of the coverage, formatted as a standard identifier "Patient/5350cd20de8a470aa570a852859ac87e".`,
    type: FieldType.STRING,
    required: true,
  },
  subscriberId: {
    id: 'subscriberId',
    label: 'Subscriber ID',
    description: `The patient's unique ID.`,
    type: FieldType.STRING,
    required: false,
  },
  beneficiary: {
    id: 'beneficiary',
    label: 'Beneficiary',
    description: `The patient the coverage is intended for, formatted as a standard identifier "Patient/5350cd20de8a470aa570a852859ac87e".`,
    type: FieldType.STRING,
    required: true,
  },
  relationship: {
    id: 'relationship',
    label: 'Relationship',
    description: `The beneficiary's relationship to the subscriber, as defined in http://hl7.org/fhir/ValueSet/subscriber-relationship.`,
    type: FieldType.JSON,
    required: true,
  },
  periodStart: {
    id: 'periodStart',
    label: 'periodStart',
    description: `When the coverage became active for the patient, expressed in FHIR Date format (YYYY-MM-DD).`,
    type: FieldType.STRING,
    required: true,
  },
  periodEnd: {
    id: 'periodEnd',
    label: 'periodEnd',
    description: `When the coverage was no longer active for the patient, expressed in FHIR Date format (YYYY-MM-DD).`,
    type: FieldType.STRING,
    required: false,
  },
  payor: {
    id: 'payor',
    label: 'Payor',
    description: `Details of the payor, as definded in https://docs.canvasmedical.com/reference/coverage-create`,
    type: FieldType.JSON,
    required: true,
  },
  classCoverage: {
    id: 'classCoverage',
    label: 'Class',
    description: `Definition of the plan, subplan, group, and subgroup, as definded in https://docs.canvasmedical.com/reference/coverage-create`,
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  id: z.string(),
  order: z.coerce.number().min(1).max(5),
  status: z.string(),
  type: JsonSchema.optional(),
  subscriber: createReferenceSchema('Patient'),
  subscriberId: z.string().optional(),
  beneficiary: createReferenceSchema('Patient'),
  relationship: JsonSchema,
  periodStart: DateOnlySchema,
  periodEnd: DateOnlySchema.optional(),
  payor: JsonArraySchema,
  classCoverage: JsonArraySchema.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
