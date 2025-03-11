import { z } from 'zod'
import { StructuredOutputParser } from '@langchain/core/output_parsers'

export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    from: z.string().optional().nullable(),
    to: z.string().optional().nullable(),
    instructions: z.string().optional().nullable(),
  }),
)

export interface InstructionsWithDatesExtracted {
  from?: string | null
  to?: string | null
  instructions?: string | null
}
