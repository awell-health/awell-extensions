import { systemPrompt } from './constants'
import { type ChatOpenAI } from '@langchain/openai'


// TODO: remove console logs eventually
export const summarizeFormWithLLM = async ({
  ChatModelGPT4o,
  form_data,
  stakeholder,
  additional_instructions,
}: {
  ChatModelGPT4o: ChatOpenAI
  form_data: string
  stakeholder: string
  additional_instructions: string
}): Promise<string> => {
  const prompt = await systemPrompt.format({
    stakeholder: stakeholder,
    additional_instructions: additional_instructions,
    input: form_data,
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
