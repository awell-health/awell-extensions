import { parser, systemPrompt } from './constants'
import { type ChatOpenAI } from '@langchain/openai'

export const categorizeMessageWithLLM = async ({
  ChatModelGPT4oMini,
  message,
  categories,
}: {
  ChatModelGPT4oMini: ChatOpenAI
  message: string
  categories: string[]
}): Promise<string> => {
  const prompt = await systemPrompt.format({
    categories: categories.concat('None').join(', '),
    input: message,
  })

  const chain = ChatModelGPT4oMini.pipe(parser)
  console.log('Prompt:', prompt)
  const result = await chain.invoke(prompt)

  console.log('Result', typeof result)

  const matchedCategory = result.matched_category ?? 'None'
  console.log('I am matching:', matchedCategory)

  // Ensure that the returned matched entity is valid
  const category = categories.includes(matchedCategory) ? matchedCategory : 'None'

  return category
}
