import { type z } from 'zod'
import { TicketSchema } from './atoms'

export const GetTicketResponseSchema = TicketSchema

export type GetTicketResponseType = z.infer<typeof GetTicketResponseSchema>
