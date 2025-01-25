import { z } from 'zod'
import { StructuredOutputParser } from '@langchain/core/output_parsers'

export const AppointmentsSchema = z.array(z.coerce.number())
  .describe('Array of appointment IDs that match the criteria')

export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    appointmentIds: AppointmentsSchema,
    explanation: z
      .string()
      .describe(
        'A readable explanation of how the appointments were found and why',
      ),
  })
)

export interface AppointmentsFromAI {
  appointmentIds: number[]
  explanation: string
} 