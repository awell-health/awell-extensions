import { parser, systemPrompt } from './constants'
import { type OpenAI } from '@langchain/openai'

export const categorizeMessageWithLLM = async ({
  langChainOpenAiSdk,
  message,
  categories,
}: {
  langChainOpenAiSdk: OpenAI
  message: string
  categories: string[]
}): Promise<string> => {
  const prompt = await systemPrompt.format({
    categories: categories.concat('None').join(', '),
    input: message,
  })

  const chain = langChainOpenAiSdk.pipe(parser)
  console.log('Prompt:', prompt)
  const result = await chain.invoke(prompt)

  console.log('Result', typeof result)

  const matchedEntity = result.matched_entity ?? 'None'
  console.log('I am matching:', matchedEntity)

  // Ensure that the returned matched entity is valid
  const category = categories.includes(matchedEntity) ? matchedEntity : 'None'

  return category
}
