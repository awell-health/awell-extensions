import { z } from 'zod'
import { StructuredOutputParser } from '@langchain/core/output_parsers'

export const AppointmentIdSchema = z.array(z.string())

export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    appointmentIds: AppointmentIdSchema,
    explanation: z
      .string()
      .describe(
        'A readable explanation of how the appointments were found and why',
      ),
  }),
)

export type AppointmentResultType = z.infer<typeof parser.schema>