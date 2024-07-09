import {
  type Field,
  FieldType,
  DateTimeSchema,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { z, ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient you want to create an appointment for.',
    type: FieldType.STRING,
    required: true,
  },
  otherPartyId: {
    id: 'otherPartyId',
    label: 'Provider ID',
    description:
      'The ID of the provider the appointment is with. If none provided, the user the API key is associated with will be used.',
    type: FieldType.STRING,
  },
  contactTypeId: {
    id: 'contactTypeId',
    label: 'Contact type ID',
    description: 'How the appointment will be conducted.',
    type: FieldType.STRING,
    required: true,
  },
  appointmentTypeId: {
    id: 'appointmentTypeId',
    label: 'Appointment type ID',
    description: 'The ID of the appointment type.',
    type: FieldType.STRING,
    required: true,
  },
  datetime: {
    id: 'datetime',
    label: 'Appointment date and time',
    description: 'The date and time of the appointment in ISO8601 format.',
    type: FieldType.DATE,
    required: true,
  },
  metadata: {
    id: 'metadata',
    label: 'Metadata',
    description: '',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: z.string().min(1),
  otherPartyId: z.string().optional(),
  contactTypeId: z.string().min(1),
  appointmentTypeId: z.string().min(1),
  datetime: DateTimeSchema,
  metadata: z.string().transform((str, ctx): Record<string, any> => {
    if (isNil(str) || isEmpty(str)) return {}
    try {
      return JSON.parse(str)
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
