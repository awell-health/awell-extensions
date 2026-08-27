import { FieldType, type Field } from '@awell-health/extensions-core'
import {
  TypeSchema,
  StatusSchema,
} from '../../../lib/api/customFhirSchemas/DocumentReference'
import { startCase } from 'lodash'
import z, { type ZodType } from 'zod'

export const fields = {
  patientResourceId: {
    id: 'patientResourceId',
    label: 'Patient resource ID',
    type: FieldType.STRING,
    description: 'The patient’s FHIR resource ID.',
    required: true,
  },
  encounterResourceId: {
    id: 'encounterResourceId',
    label: 'Encounter resource ID',
    description: 'The FHIR resource ID of the related encounter.',
    type: FieldType.STRING,
    required: true,
  },
  status: {
    id: 'status',
    label: 'Document status',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: StatusSchema.options.map((value) => ({
        value,
        label: startCase(value),
      })),
    },
  },
  type: {
    id: 'type',
    label: 'Document type',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: TypeSchema.options.map((value) => ({
        value,
        label: startCase(value),
      })),
    },
  },
  note: {
    id: 'note',
    label: 'Note',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientResourceId: z.string().min(1),
  encounterResourceId: z.string().min(1),
  status: StatusSchema,
  type: TypeSchema,
  note: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodType>)
