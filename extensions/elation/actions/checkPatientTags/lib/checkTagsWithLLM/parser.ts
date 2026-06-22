import { z } from 'zod'
import { StructuredOutputParser } from '@langchain/core/output_parsers'

export const CheckTagsOutputSchema = z.object({
  tagsFound: z.boolean(),
  explanation: z.string(),
})

export type CheckTagsOutput = z.infer<typeof CheckTagsOutputSchema>

export const parser = StructuredOutputParser.fromZodSchema(
  CheckTagsOutputSchema,
)
