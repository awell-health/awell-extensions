import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

/**
 * Structured Output Parser
 * Ensures LLM response follows the format:
 * {
 *   matched_category: string  // One of the provided categories or "None"
 *   match_explanation: string // Brief explanation of the categorization
 * }
 */
export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    matched_category: z.string().optional().default('None'),
    match_explanation: z.string(),
  })
) 