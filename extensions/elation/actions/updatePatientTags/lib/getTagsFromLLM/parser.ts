import { z } from 'zod'
import { StructuredOutputParser } from '@langchain/core/output_parsers'

export const SingleTagSchema = z.string()

export const TagsSchema = z
  .array(SingleTagSchema)
  .describe('The updated array of tags')

export const TagsOutputSchema = z.object({
  updatedTags: TagsSchema,
  explanation: z
    .string()
    .describe('A single, concise sentence summarizing all tag modifications, including the reasoning behind the changes or lack thereof.'),
})

export const parser = StructuredOutputParser.fromZodSchema(TagsOutputSchema)

export type TagsOutput = z.infer<typeof TagsOutputSchema>

export interface TagsFromAI {
  validatedTags: string[]
  explanation: string
}
