import { parser } from './parser'
import { systemPrompt } from './prompt'
import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from "@langchain/core/callbacks/base"

/**
 * Uses LLM to categorize a message into predefined categories.
 * The function follows these steps:
 * 1. Formats prompt with available categories
 * 2. Runs LLM chain with structured output parsing
 * 3. Validates and processes the result
 * 
 * @example
 * const result = await categorizeMessageWithLLM({
 *   model,
 *   message: "I need to schedule an appointment",
 *   categories: ["Scheduling", "Medical Question"],
 *   metadata: { ... }
 * })
 * // Returns: { category: "Scheduling", explanation: "..." }
 */
export const categorizeMessageWithLLM = async ({
  model,
  message,
  categories,
  metadata,
  callbacks,
}: {
  model: ChatOpenAI
  message: string
  categories: string[]
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}): Promise<{ category: string; explanation: string }> => {
  const prompt = await systemPrompt.format({
    categories: categories.concat('None').join(', '),
    input: message,
  })

  const chain = model.pipe(parser)

  let result
  try {
    result = await chain.invoke(
      prompt,
      { metadata, runName: 'ShellyCategorizeMessage', callbacks }
    )
  } catch (error) {
    throw new Error(
      'Failed to categorize the message due to an internal error.'
    )
  }

  const matchedCategory = result.matched_category ?? 'None'
  let category: string
  let explanation: string = result.match_explanation ?? ''

  // Check if the matched category is valid
  if (categories.includes(matchedCategory)) {
    category = matchedCategory
  } else {
    category = 'None'
    explanation =
      'Categorization was ambiguous; we could not find a proper category.'
  }

  return { category, explanation }
}
