import { parser } from './parser'
import { systemPrompt } from './prompt'
import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'

/**
 * Uses LLM to extract structured data from a message according to a provided schema.
 * The function follows these steps:
 * 1. Formats prompt with schema and message
 * 2. Runs LLM chain with structured output parsing
 * 3. Validates and processes the result
 *
 * @example
 * const result = await parseStructuredDataWithLLM({
 *   model,
 *   message: "Patient John Doe, age 45, scheduled for tomorrow at 2pm",
 *   schema: { name: "string", age: "number", appointmentTime: "string" },
 *   metadata: { ... }
 * })
 * // Returns: {
 * //   data: { name: "John Doe", age: 45, appointmentTime: "2pm tomorrow" },
 * //   confidenceLevel: 85,
 * //   explanation: "..."
 * // }
 */
export const parseStructuredDataWithLLM = async ({
  model,
  message,
  schema,
  instructions,
  metadata,
  callbacks,
}: {
  model: ChatOpenAI
  message: string
  schema: Record<string, string>
  instructions?: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}): Promise<{
  data: Record<string, any>
  confidenceLevel: number
  explanation: string
}> => {
  const prompt = await systemPrompt.format({
    schema: JSON.stringify(schema, null, 2),
    input: message,
    instructions:
      instructions ?? 'No additional instructions have been provided',
  })

  const chain = model.pipe(parser)

  let result
  try {
    result = await chain.invoke(prompt, {
      metadata,
      runName: 'ShellyParseStructuredData',
      callbacks,
    })
  } catch (error) {
    throw new Error(
      'Failed to parse structured data from the message due to an internal error.',
    )
  }

  return {
    data: result.extracted_data ?? {},
    confidenceLevel: result.confidence_level ?? 0,
    explanation: result.extraction_explanation ?? '',
  }
}
