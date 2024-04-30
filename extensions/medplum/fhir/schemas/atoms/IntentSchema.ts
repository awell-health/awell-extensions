import { z } from 'zod'

export const ServiceRequestIntentSchema = z.union([
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

export const TaskIntentSchema = z.union([
  z.literal('unknown'),
  z.literal('proposal'),
  z.literal('plan'),
  z.literal('order'),
  z.literal('original-order'),
  z.literal('reflex-order'),
  z.literal('filler-order'),
  z.literal('instance-order'),
  z.literal('option'),
])
