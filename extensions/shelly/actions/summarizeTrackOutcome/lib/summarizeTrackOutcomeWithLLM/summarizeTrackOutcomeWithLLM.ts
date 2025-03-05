import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { systemPrompt } from './prompt'

/**
 * Uses LLM to summarize track outcomes and decision paths.
 * The function follows these steps:
 * 1. Formats prompt with instructions
 * 2. Runs LLM to generate summary
 * 3. Returns formatted summary
 * 
 * @example
 * const summary = await summarizeTrackOutcomeWithLLM({
 *   model,
 *   careFlowActivities: "...",
 *   instructions: "Focus on decision path",
 *   metadata: { ... }
 * })
 */
export const summarizeTrackOutcomeWithLLM = async ({
  model,
  careFlowActivities,
  instructions = '',
  metadata,
  callbacks,
}: {
  model: ChatOpenAI
  careFlowActivities: string
  instructions?: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}): Promise<string> => {
  const messages = await systemPrompt.formatMessages({
    input: careFlowActivities,
    instructions,
  })

  const response = await model.invoke(messages, {
    callbacks,
    runName: 'ShellySummarizeTrackOutcome',
    metadata,
  })

  return typeof response.content === 'string' 
    ? response.content 
    : JSON.stringify(response.content)
} 