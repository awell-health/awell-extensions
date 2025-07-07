import { z } from 'zod'

export const TicketStatus = {
  Open: 2,
  Pending: 3,
  Resolved: 4,
  Closed: 5,
} as const

export const TicketStatusDescriptionString = Object.entries(TicketStatus)
  .map(([key, value]) => `${value} (${key})`)
  .join(', ')

export const TicketStatusSchema = z.union([
  z.literal(TicketStatus.Open),
  z.literal(TicketStatus.Pending),
  z.literal(TicketStatus.Resolved),
  z.literal(TicketStatus.Closed),
])

export type TicketStatusCode = z.infer<typeof TicketStatusSchema>
export type TicketStatusType = keyof typeof TicketStatus
