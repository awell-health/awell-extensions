import { systemPrompt } from './constants'
import { type ChatOpenAI } from '@langchain/openai'

// TODO: remove console logs eventually
export const summarizeCareFlowWithLLM = async ({
  ChatModelGPT4o,
  careFlowActivities,
  stakeholder,
  additionalInstructions,
}: {
  ChatModelGPT4o: ChatOpenAI
  careFlowActivities: string
  stakeholder: string
  additionalInstructions: string
}): Promise<string> => {
  const prompt = await systemPrompt.format({
    stakeholder,
    additionalInstructions,
    input: careFlowActivities,
  })
  const summaryMessage = await ChatModelGPT4o.invoke(prompt)

  // TODO: for some reason compiler doesn't know that content is a string
  const summary = summaryMessage.content as string

  return summary
}
