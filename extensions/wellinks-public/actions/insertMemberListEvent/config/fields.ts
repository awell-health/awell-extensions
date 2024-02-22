import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  eventName: {
    id: 'eventName',
    label: 'Event Name',
    description:
      'The member list event name (Marked Ineligble, Enrolled, Unenrolled, etc)',
    type: FieldType.STRING,
    required: true,
  },
  memberId: {
    id: 'memberId',
    label: 'Member ID',
    description: 'The Wellinks ID of the patient.',
    type: FieldType.STRING,
    required: true,
  },
  sourceName: {
    id: 'sourceName',
    label: 'Source',
    description:
      'The source of the Member List Event (Sendgrid, Member Medical History CCA, Member Event Form, etc)',
    type: FieldType.STRING,
    required: true,
  },
  sendgridListId: {
    id: 'sendgridListId',
    label: 'Sendgrid List ID',
    description: 'The ID of the Sendgrid list.',
    type: FieldType.STRING,
    required: true,
  },
  originatorName: {
    id: 'originatorName',
    label: 'Originator',
    description: 'The originator of the event (Memeber, Coach, etc)',
    type: FieldType.STRING,
    required: true,
  },
  eventDate: {
    id: 'eventDate',
    label: 'Event Date',
    description: 'The Date/Time of the Member List Event',
    type: FieldType.DATE,
    required: true,
  },
  lockedById: {
    id: 'lockedById',
    label: 'Locked By ID',
    description:
      'The ID of the coach that signed and locked the healthie form.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  eventName: z.string(),
  memberId: z.string(),
  sourceName: z.string(),
  sendgridListId: z.string(),
  originatorName: z.string(),
  eventDate: z.string(),
  lockedById: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
