import { z } from 'zod'

const StatusSchema = z.union([
  z.literal('draft'),
  z.literal('active'),
  z.literal('on-hold'),
  z.literal('revoked'),
  z.literal('completed'),
  z.literal('entered-in-error'),
  z.literal('unknown'),
])

const IntentSchema = z.union([
  z.literal('proposal'),
  z.literal('plan'),
  z.literal('directive'),
  z.literal('order'),
  z.literal('original-order'),
  z.literal('reflex-order'),
  z.literal('filler-order'),
  z.literal('instance-order'),
  z.literal('option'),
])

const PrioritySchema = z.union([
  z.literal('routine'),
  z.literal('urgent'),
  z.literal('asap'),
  z.literal('stat'),
])

export const CreateServiceRequestSchema = z.object({
  patientId: z.string().nonempty('Missing Medplum patient ID'),
  status: StatusSchema,
  intent: IntentSchema,
  priority: PrioritySchema.optional(),
})
