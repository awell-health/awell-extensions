import { z } from 'zod'

export const TicketSource = {
  Email: 1,
  Portal: 2,
  Phone: 3,
  Chat: 7,
  FeedbackWidget: 9,
  OutboundEmail: 10,
} as const

export const TicketSourceDescriptionString = Object.entries(TicketSource)
  .map(([key, value]) => `${value} (${key})`)
  .join(', ')

export const TicketSourceSchema = z.union([
  z.literal(TicketSource.Email),
  z.literal(TicketSource.Portal),
  z.literal(TicketSource.Phone),
  z.literal(TicketSource.Chat),
  z.literal(TicketSource.FeedbackWidget),
  z.literal(TicketSource.OutboundEmail),
])

export type TicketSourceCode = z.infer<typeof TicketSourceSchema>
export type TicketSourceType = keyof typeof TicketSource
