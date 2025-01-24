import { FieldType, type Field } from '@awell-health/extensions-core'
import { type ZodObject, type ZodTypeAny } from 'zod'
import { CreateServiceRequestSchema } from '../../../fhir/schemas/resources/serviceRequest.schema'
import {
  ServiceRequestStatusSchema,
  ServiceRequestIntentSchema,
  PrioritySchema,
} from '../../../../../src/lib/fhir/schemas/ServiceRequest'

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
    description: 'The status of the order',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(ServiceRequestStatusSchema.enum).map(
        (status) => ({
          label: status,
          value: status,
        }),
      ),
    },
  },
  intent: {
    id: 'intent',
    label: 'Mobile phone',
    description:
      'Whether the request is a proposal, plan, an original order or a reflex order.',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.values(ServiceRequestIntentSchema.enum).map(
        (intent) => ({
          label: intent,
          value: intent,
        }),
      ),
    },
  },
  priority: {
    id: 'priority',
    label: 'Priority',
    description: 'The priority of the order',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(PrioritySchema.enum).map((priority) => ({
        label: priority,
        value: priority,
      })),
    },
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema =
  CreateServiceRequestSchema satisfies ZodObject<
    Record<keyof typeof fields, ZodTypeAny>
  >
