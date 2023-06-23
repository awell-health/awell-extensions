import { z } from 'zod'
import { createReferenceSchema } from './reference.zod'
import { instant } from './primitive'

const pratictionerParticipant = z.object({
  actor: z.object({
    reference: createReferenceSchema('Practitioner'),
  }),
  status: z.literal('accepted'),
})

const patientParticipant = z.object({
  actor: z.object({
    reference: createReferenceSchema('Patient'),
  }),
  status: z.literal('accepted'),
})

export const appointmentSchema = z.object({
  resourceType: z.literal('Appointment'),
  reasonCode: z.array(
    z.object({
      coding: z.object({
        system: z.literal('INTERNAL'),
        code: z.string(),
        display: z.string(),
      }),
      text: z.string(),
    })
  ),
  participant: z.union([
    z.tuple([pratictionerParticipant]),
    z.tuple([pratictionerParticipant, patientParticipant]),
  ]),
  appointmentType: z.object({
    coding: z.array(
      z.object({
        system: z.literal('http://snomed.info/sct'),
        code: z.enum([
          '439708006',
          '448337001',
          '308335008',
          '31108002',
          '185317003',
        ]),
        display: z.string(),
      })
    ),
  }),
  start: instant,
  end: instant,
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
  contained: z.array(
    z.object({
      resourceType: z.literal('Endpoint'),
      id: z.literal('appointment-meeting-endpoint'),
      url: z.string(),
    })
  ),
  status: z.literal('proposed'),
})

export const appointmentWithIdSchema = appointmentSchema.extend({
  id: z.string(),
})

export type Appointment = z.infer<typeof appointmentSchema>
