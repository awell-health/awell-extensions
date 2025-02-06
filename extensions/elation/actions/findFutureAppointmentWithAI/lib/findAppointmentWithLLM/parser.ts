import { z } from 'zod'
import { StructuredOutputParser } from '@langchain/core/output_parsers'

export const AppointmentIdSchema = z.coerce
  .number()
  .nullable()
  .describe('A single appointment')

export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    appointmentId: AppointmentIdSchema,
    explanation: z
      .string()
      .describe(
        'A readable explanation of how the appointment was found and why',
      ),
  })
)

export interface AppointmentFromAI {
  appointmentId: number | null
  explanation: string
} 