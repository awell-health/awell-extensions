import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { TagsOutputSchema, type TagsFromAI } from '../../config/types'

export const parser = StructuredOutputParser.fromZodSchema(TagsOutputSchema)
export type { TagsFromAI } 