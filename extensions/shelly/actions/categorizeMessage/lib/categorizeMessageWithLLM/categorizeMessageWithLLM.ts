import { parser, systemPrompt } from './constants'
import { type ChatOpenAI } from '@langchain/openai'

// TODO: remove console logs eventually
export const categorizeMessageWithLLM = async ({
  ChatModelGPT4oMini,
  message,
  categories,
}: {
  ChatModelGPT4oMini: ChatOpenAI
  message: string
  categories: string[]
}): Promise<{ category: string; explanation: string }> => {
  const prompt = await systemPrompt.format({
    categories: categories.concat('None').join(', '),
    input: message,
  })

  const chain = ChatModelGPT4oMini.pipe(parser)
  console.log('Prompt:', prompt)
  let result
  try {
    result = await chain.invoke(prompt)
  } catch (error) {
    console.error('Error invoking the chain:', error)
    throw new Error(
      'Failed to categorize the message due to an internal error.'
    )
  }

  console.log('Result', typeof result)

  const matchedCategory = result.matched_category ?? 'None'
  let category: string
  let explanation: string = result.match_explanation ?? ''

  console.log('Matched Category:', matchedCategory)
  console.log('Explanation:', explanation)
  // Check if the matched category is valid
  if (categories.includes(matchedCategory)) {
    category = matchedCategory
  } else {
    category = 'None'
    explanation =
      'Categorization was ambiguous; we could not find a proper category.'
  }

  return { category, explanation }
}
