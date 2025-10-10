import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

/**
 * Structured Output Parser
 * Ensures LLM response follows the format:
 * {
 *   extracted_data: Record<string, any>  // Data matching the provided schema
 *   confidence_level: number              // 0-100 indicating extraction reliability
 *   extraction_explanation: string        // Brief explanation of the extraction
 * }
 */
export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    extracted_data: z
      .record(z.any())
      .describe('Extracted data matching the schema'),
    confidence_level: z
      .number()
      .min(0)
      .max(100)
      .describe('Confidence level of the extraction (0-100)'),
    extraction_explanation: z
      .string()
      .describe('Brief explanation of the extraction process'),
  }),
)
