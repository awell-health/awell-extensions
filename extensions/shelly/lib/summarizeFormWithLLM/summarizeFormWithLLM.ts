import { systemPromptBulletPoints, systemPromptTextParagraph } from './prompt'
import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../src/lib/llm/openai/types'

/**
 * Uses LLM to summarize form data in a specified format and language.
 * The function follows these steps:
 * 1. Formats prompt with form data and preferences
 * 2. Runs LLM with appropriate system prompt
 * 3. Returns formatted summary with disclaimer
 * 
 * @example
 * const result = await summarizeFormWithLLM({
 *   model,
 *   formData: "Name: John Doe\nAge: 30\n...",
 *   summaryFormat: "Bullet-points",
 *   language: "English",
 *   disclaimerMessage: "AI generated...",
 *   metadata: { ... }
 * })
 */
export const summarizeFormWithLLM = async ({
  model,
  formData,
  summaryFormat,
  language,
  disclaimerMessage,
  metadata,
}: {
  model: ChatOpenAI
  formData: string
  summaryFormat: string
  language: string
  disclaimerMessage: string
  metadata: AIActionMetadata
}): Promise<string> => {
  const systemPrompt = summaryFormat === 'Bullet-points' ? systemPromptBulletPoints : 
                      summaryFormat === 'Text paragraph' ? systemPromptTextParagraph :
                      systemPromptBulletPoints // Default to bullet points if unknown format

  const prompt = await systemPrompt.format({
    language,
    input: formData,
    disclaimerMessage,
  })

  try {
    const result = await model.invoke(
      prompt,
      { metadata, runName: 'ShellySummarizeForm' }
    )

    return result.content as string
  } catch (error) {
    console.error('Error in summarizeFormWithLLM:', error)
    throw new Error('Failed to generate form summary')
  }
}
