import { parser, systemPrompt } from './constants'
import { type ChatOpenAI } from '@langchain/openai'

export const categorizeMessageWithLLM = async ({
  ChatModelGPT4o,
  message,
  categories,
}: {
  ChatModelGPT4o: ChatOpenAI
  message: string
  categories: string[]
}): Promise<string> => {
  const prompt = await systemPrompt.format({
    categories: categories.concat('None').join(', '),
    input: message,
  })

  const chain = ChatModelGPT4o.pipe(parser)
  console.log('Prompt:', prompt)
  const result = await chain.invoke(prompt)

  console.log('Result', typeof result)

  const matchedEntity = result.matched_entity ?? 'None'
  console.log('I am matching:', matchedEntity)

  // Ensure that the returned matched entity is valid
  const category = categories.includes(matchedEntity) ? matchedEntity : 'None'

  return category
}
