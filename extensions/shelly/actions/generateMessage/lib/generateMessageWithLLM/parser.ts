import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

/**
 * Message Generation Output Schema
 * Defines the expected structure of the LLM response:
 * - subject: Clear, professional subject line
 * - message: Complete, markdown-formatted message body
 */
export const messageSchema = z.object({
  subject: z.string(),
  message: z.string(),
})

export const parser = StructuredOutputParser.fromZodSchema(messageSchema) 