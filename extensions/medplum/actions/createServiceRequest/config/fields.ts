import { FieldType, type Field } from '@awell-health/extensions-core'
import { type ZodObject, type ZodTypeAny } from 'zod'
import { CreateServiceRequestSchema } from '../../../fhir/schemas/resources/serviceRequest.schema'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'ID of the patient in Medplum',
    type: FieldType.STRING,
    required: true,
  },
  status: {
    id: 'status',
    label: 'Status',
    description:
      'The status of the order. Allowed values: draft | active | on-hold | revoked | completed | entered-in-error | unknown',
    type: FieldType.STRING,
    required: true,
  },
  intent: {
    id: 'intent',
    label: 'Mobile phone',
    description:
      'Whether the request is a proposal, plan, an original order or a reflex order. Allowed values: proposal | plan | directive | order | original-order | reflex-order | filler-order | instance-order | option',
    type: FieldType.STRING,
    required: true,
  },
  priority: {
    id: 'priority',
    label: 'Priority',
    description: 'Allowed values: routine | urgent | asap | stat',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema =
  CreateServiceRequestSchema satisfies ZodObject<
    Record<keyof typeof fields, ZodTypeAny>
  >
