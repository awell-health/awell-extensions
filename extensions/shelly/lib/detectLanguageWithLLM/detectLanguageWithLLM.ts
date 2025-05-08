import { systemPrompt } from './prompt'
import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from "@langchain/core/callbacks/base"

/**
 * Uses LLM to detect the language of a given text.
 * The function follows these steps:
 * 1. Formats prompt with the input text
 * 2. Runs LLM to identify the language
 * 3. Returns the full language name (e.g., "English", "Croatian")
 */
export const detectLanguageWithLLM = async ({
  model,
  text,
  metadata,
  callbacks,
}: {
  model: ChatOpenAI
  text: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}): Promise<string> => {
  const prompt = await systemPrompt.format({
    input: text,
  })

  try {
    const result = await model.invoke(
      prompt,
      { 
        metadata, 
        runName: 'ShellyDetectLanguage',
        callbacks
      }
    )

    return result.content as string
  } catch (error) {
    throw new Error('Failed to detect language')
  }
} 