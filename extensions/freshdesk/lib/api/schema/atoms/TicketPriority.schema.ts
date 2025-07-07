import { z } from 'zod'

export const TicketPriority = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4,
} as const

export const TicketPriorityDescriptionString = Object.entries(TicketPriority)
  .map(([key, value]) => `${value} (${key})`)
  .join(', ')

export const TicketPrioritySchema = z.union([
  z.literal(TicketPriority.Low),
  z.literal(TicketPriority.Medium),
  z.literal(TicketPriority.High),
  z.literal(TicketPriority.Urgent),
])

export type TicketPriorityCode = z.infer<typeof TicketPrioritySchema>
export type TicketPriorityType = keyof typeof TicketPriority
