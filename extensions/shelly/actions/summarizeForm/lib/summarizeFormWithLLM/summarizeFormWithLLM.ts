import { systemPrompt } from './constants'
import { type ChatOpenAI } from '@langchain/openai'

// TODO: remove console logs eventually
export const summarizeFormWithLLM = async ({
  ChatModelGPT4o,
  formData,
  stakeholder,
  additionalInstructions,
}: {
  ChatModelGPT4o: ChatOpenAI
  formData: string
  stakeholder: string
  additionalInstructions: string
}): Promise<string> => {
  const prompt = await systemPrompt.format({
    stakeholder,
    additionalInstructions,
    input: formData,
  })
  console.log('Prompt', prompt)
  const summaryMessage = await ChatModelGPT4o.invoke(prompt)

  console.log('Type', typeof summaryMessage.content)
  // TODO: for some reason compiler doesn't know that content is a string
  const summary = summaryMessage.content as string
  console.log('Type', typeof summary)
  console.log('Summary', summary)
  return summary
}
