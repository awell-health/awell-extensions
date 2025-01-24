import { parser } from './parser'
import { systemPrompt } from './prompt'
import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from "@langchain/core/callbacks/base"

/**
 * Generates a personalized message using LLM with retry logic
 * 
 * @param model - OpenAI chat model
 * @param communicationObjective - Purpose of the message
 * @param personalizationInput - Details for message customization
 * @param stakeholder - Target recipient (e.g., Patient, Clinician)
 * @param language - Message language
 * @param metadata - Tracking info for LangSmith
 * @param callbacks - Optional callbacks for LangChain
 * @returns Generated subject and message
 */
export const generateMessageWithLLM = async ({
  model,
  communicationObjective,
  personalizationInput,
  stakeholder,
  language,
  metadata,
  callbacks,
}: {
  model: ChatOpenAI
  communicationObjective: string
  personalizationInput: string
  stakeholder: string
  language: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}): Promise<{ subject: string; message: string }> => {
  // 1. Prepare prompt with inputs
  const prompt = await systemPrompt.format({
    communicationObjective,
    personalizationInput,
    stakeholder,
    language,
  })

  // 2. Create chain with structured output
  const structured_output_chain = model.pipe(parser)

  // 3. Run chain with retries
  const MAX_RETRIES = 3
  let retries = 0
  let subject = ''
  let message = ''
  
  while (retries < MAX_RETRIES) { // Sometimes the LLM returns a non-JSON response
    try {
      const generated_message = await structured_output_chain.invoke(
        prompt,
        { metadata, runName: 'ShellyGenerateMessage', callbacks }
      )
      subject = generated_message.subject ?? ''
      message = generated_message.message ?? ''

      // If subject or message are not directly available, try parsing AIMessageChunk
      if (subject.trim() === '' || message.trim() === '') {
        // Attempt to get content from AIMessageChunk
        if ('content' in generated_message) {
          try {
            const parsedContent = JSON.parse(generated_message.content as string)
            if (typeof parsedContent === 'object' && parsedContent !== null) {
              if ('subject' in parsedContent && typeof parsedContent.subject === 'string') {
                subject = parsedContent.subject
              }
              if ('message' in parsedContent && typeof parsedContent.message === 'string') {
                message = parsedContent.message
              }
            }
          } catch (error) {
            throw new Error('Error parsing message content')
          }
        }
      }

      // If we have both subject and message, break the loop
      if (subject.trim() !== '' && message.trim() !== '') {
        break
      }

      // If we reach here, it means we didn't get valid subject and message
      throw new Error('Failed to generate valid subject and message')
    } catch (error) {
      retries++
      if (retries >= MAX_RETRIES) {
        throw new Error('Failed to generate the message after multiple attempts')
      }
    }
  }

  return { subject, message }
}
