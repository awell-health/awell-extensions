import { parser, systemPrompt } from './constants'
import { type ChatOpenAI } from '@langchain/openai'

export const generateMessageWithLLM = async ({
  ChatModelGPT4o,
  communicationObjective,
  personalizationInput,
  additionalInstructions,
  stakeholder,
  language,
}: {
  ChatModelGPT4o: ChatOpenAI
  communicationObjective: string
  personalizationInput: string
  additionalInstructions: string
  stakeholder: string
  language: string
}): Promise<{ subject: string; message: string }> => {
  const prompt = await systemPrompt.format({
    communicationObjective,
    personalizationInput,
    additionalInstructions,
    stakeholder,
    language,
  })
  console.log('Prompt', prompt)
  const structured_output_chain = ChatModelGPT4o.pipe(parser)

  const MAX_RETRIES = 3;
  let retries = 0;
  let subject = '';
  let message = '';
  
  // TODO: do it with more grace eventually
  while (retries < MAX_RETRIES) { // Sometimes the LLM returns a non-JSON response
    try {
      const generated_message = await structured_output_chain.invoke(prompt);
      subject = generated_message.subject ?? '';
      message = generated_message.message ?? '';

      // If subject or message are not directly available (parser issue), try parsing AIMessageChunk
      if (subject.trim() === '' || message.trim() === '') {
        console.log('Attempting to parse AIMessageChunk...');

        // Attempt to get content from AIMessageChunk
        if ('content' in generated_message) {
          try {
            const parsedContent = JSON.parse(generated_message.content as string);
            if (typeof parsedContent === 'object' && parsedContent !== null) {
              if ('subject' in parsedContent && typeof parsedContent.subject === 'string') {
                subject = parsedContent.subject;
              }
              if ('message' in parsedContent && typeof parsedContent.message === 'string') {
                message = parsedContent.message;
              }
            }
          } catch (error) {
            console.error('Error parsing AIMessageChunk content:', error);
          }
        }
      }

      // If we have both subject and message, break the loop
      if (subject.trim() !== '' && message.trim() !== '') {
        break;
      }

      // If we reach here, it means we didn't get valid subject and message
      throw new Error('Failed to generate valid subject and message');
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries >= MAX_RETRIES) {
        throw new Error('Failed to generate the message after multiple attempts');
      }
    }
  }
  // TODO: remove this eventually
  console.log('Subject', subject);
  console.log('Message', message);
  return { subject, message };
}