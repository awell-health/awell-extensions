import { DateTimeSchema } from '@awell-health/extensions-core'
import { z } from 'zod'
import { createReferenceSchema } from './reference.zod'

const reasonCodeSchema = z.object({
  coding: z.array(
    z.object({
      system: z.literal('INTERNAL'),
      code: z.string(),
      display: z.string(),
    })
  ),
  text: z.string(),
})

const participantSchema = z.object({
  actor: z.object({
    reference: z.union([
      createReferenceSchema('Practitioner'),
      createReferenceSchema('Patient'),
    ]),
  }),
  status: z.literal('accepted'),
})

const containedSchema = z.object({
  resourceType: z.literal('Endpoint'),
  id: z.string(),
  status: z.string(),
  connectionType: z.object({
    code: z.string(),
  }),
  payloadType: z.array(
    z.object({
      coding: z.array(
        z.object({
          code: z.string(),
        })
      ),
    })
  ),
  address: z.string(),
})

export const appointmentSchema = z.object({
  resourceType: z.literal('Appointment'),
  reasonCode: z.array(reasonCodeSchema).optional(),
  description: z.string().optional(),
  participant: z.array(participantSchema).optional(),
  appointmentType: z.object({
    coding: z.array(
      z.object({
        system: z.literal('http://snomed.info/sct'),
        // Note: https://docs.canvasmedical.com/reference/appointment-create#appointmenttype,
        code: z.string(),
        display: z.string(),
      })
    ),
  }),
  start: DateTimeSchema,
  end: DateTimeSchema,
  supportingInformation: z.array(
    z.union([
      z.object({
        reference: createReferenceSchema('Location'),
      }),
      z.object({
        reference: z.literal('#appointment-meeting-endpoint'),
        type: z.literal('Endpoint'),
      }),
    ])
  ),
  contained: z.array(containedSchema).optional(),
  status: z.literal('proposed').optional(),
})

export const appointmentWithIdSchema = appointmentSchema.extend({
  id: z.string(),
})

export type Appointment = z.infer<typeof appointmentSchema>
export type AppointmentWithId = z.infer<typeof appointmentWithIdSchema>
