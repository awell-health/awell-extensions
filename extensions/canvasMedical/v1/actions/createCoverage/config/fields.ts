import {
  DateOnlySchema,
  FieldType,
  type Field,
} from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { JsonSchema } from '../../../validation'

export const fields = {
  order: {
    id: 'order',
    label: 'Order',
    description:
      'The field accepts a numerical value from 1 to 5. This pertains to the order in which insurance coverages should be used when processing claims.',
    type: FieldType.NUMERIC,
    required: true,
  },
  status: {
    id: 'status',
    label: 'Status',
    description:
      'The field accepts a textual value and pertains to the statuses represented in the Canvas Medical system.',
    type: FieldType.STRING,
    required: true,
  },
  type: {
    id: 'type',
    label: 'Type',
    description: `The field accepts a JSON object and pertains to the Insurance Coverage Code Category, such as medical or accident, using values from http://hl7.org/fhir/ValueSet/coverage-type.`,
    type: FieldType.JSON,
    required: false,
  },
  subscriber: {
    id: 'subscriber',
    label: 'Subscriber',
    description: `The field accepts a textual value in a format formatted like "Patient/5350cd20de8a470aa570a852859ac87e" and pertains to the resource for the subscriber of the coverage.`,
    type: FieldType.STRING,
    required: true,
  },
  subscriberId: {
    id: 'subscriberId',
    label: 'Subscriber ID',
    description: `The field accepts a textual value representing a patient's unique ID.`,
    type: FieldType.STRING,
    required: false,
  },
  beneficiary: {
    id: 'beneficiary',
    label: 'Beneficiary',
    description: `The field accepts a text value in the provided format, "Patient/5350cd20de8a470aa570a852859ac87e," and it pertains to specifying which patient the coverage is intended for.`,
    type: FieldType.STRING,
    required: true,
  },
  relationship: {
    id: 'relationship',
    label: 'Relationship',
    description: `The field accepting a JSON object pertains to the beneficiary's relationship to the subscriber, as defined in the http://hl7.org/fhir/ValueSet/subscriber-relationship.`,
    type: FieldType.JSON,
    required: true,
  },
  periodStart: {
    id: 'periodStart',
    label: 'periodStart',
    description: `The field indicates when the coverage became active for the patient.`,
    type: FieldType.DATE,
    required: true,
  },
  periodEnd: {
    id: 'periodEnd',
    label: 'periodEnd',
    description: `The field indicates when the coverage was no longer active for the patient.`,
    type: FieldType.DATE,
    required: false,
  },
  payor: {
    id: 'payor',
    label: 'Payor',
    description: `The field accepts a JSON object and it relates to the payor.`,
    type: FieldType.JSON,
    required: true,
  },
  classObj: {
    id: 'classObj',
    label: 'Class',
    description: `The field accepts a JSON object, and it is used to define the plan, subplan, group, and subgroup. `,
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  order: z.coerce.number().min(1).max(5),
  status: z.string(),
  type: JsonSchema.optional(),
  subscriber: z.string(),
  subscriberId: z.string().optional(),
  beneficiary: z.string(),
  relationship: JsonSchema,
  periodStart: DateOnlySchema,
  periodEnd: DateOnlySchema.optional(),
  payor: JsonSchema,
  classObj: JsonSchema.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
