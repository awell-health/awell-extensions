import { systemPromptBulletPoints, systemPromptTextParagraph } from './constants'
import { type ChatOpenAI } from '@langchain/openai'
export const summarizeFormWithLLM = async ({
  ChatModelGPT4o,
  formData,
  summaryFormat,
  language,
}: {
  ChatModelGPT4o: ChatOpenAI
  formData: string
  summaryFormat: string
  language: string
}): Promise<string> => {
  console.log('summaryFormat', summaryFormat)
  const systemPrompt = summaryFormat === 'Bullet-points' ? systemPromptBulletPoints : 
                       summaryFormat === 'Text paragraph' ? systemPromptTextParagraph :
                       systemPromptBulletPoints; // Default to bullet points if unknown format
  const prompt = await systemPrompt.format({
    language,
    input: formData,
  })
  console.log('Prompt', prompt)
  const summaryMessage = await ChatModelGPT4o.invoke(prompt)

  // TODO: for some reason compiler doesn't know that content is a string
  const summary = summaryMessage.content as string
  console.log('Summary', summary)
  return summary
}
