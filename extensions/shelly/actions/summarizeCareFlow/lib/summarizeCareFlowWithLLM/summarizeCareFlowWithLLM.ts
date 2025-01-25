import { systemPrompt } from './prompt'
import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from "@langchain/core/callbacks/base"

/**
 * Uses LLM to summarize care flow activities.
 * The function follows these steps:
 * 1. Formats prompt with stakeholder context and instructions
 * 2. Runs LLM to generate summary
 * 3. Returns formatted summary
 * 
 * @example
 * const summary = await summarizeCareFlowWithLLM({
 *   model,
 *   careFlowActivities: "...",
 *   stakeholder: "Patient",
 *   additionalInstructions: "Focus on medications",
 *   metadata: { ... }
 * })
 */
export const summarizeCareFlowWithLLM = async ({
  model,
  careFlowActivities,
  stakeholder,
  additionalInstructions,
  metadata,
  callbacks,
}: {
  model: ChatOpenAI
  careFlowActivities: string
  stakeholder: string
  additionalInstructions: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}): Promise<string> => {
  const prompt = await systemPrompt.format({
    stakeholder,
    additionalInstructions,
    input: careFlowActivities,
  })

  try {
    const response = await model.invoke(
      prompt,
      { 
        metadata, 
        runName: 'ShellySummarizeCareFlow',
        callbacks
      }
    )
    return response.content as string
  } catch (error) {
    throw new Error(
      'Failed to summarize the care flow due to an internal error.'
    )
  }
}
