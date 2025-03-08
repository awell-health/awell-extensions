import { z } from 'zod'
import { StructuredOutputParser } from '@langchain/core/output_parsers'

export const AppointmentsSchema = z.array(z.coerce.number())

export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    appointmentIds: AppointmentsSchema,
    explanation: z.string(),
  }),
)

export interface AppointmentsFromLLM {
  appointmentIds: number[]
  explanation: string
}
