import { z } from 'zod'

export const ServiceRequestStatusSchema = z.union([
  z.literal('draft'),
  z.literal('active'),
  z.literal('on-hold'),
  z.literal('revoked'),
  z.literal('completed'),
  z.literal('entered-in-error'),
  z.literal('unknown'),
])

export const TaskStatusSchema = z.union([
  z.literal('draft'),
  z.literal('requested'),
  z.literal('received'),
  z.literal('accepted'),
  z.literal('rejected'),
  z.literal('ready'),
  z.literal('cancelled'),
  z.literal('in-progress'),
  z.literal('on-hold'),
  z.literal('failed'),
  z.literal('completed'),
  z.literal('entered-in-error'),
])
