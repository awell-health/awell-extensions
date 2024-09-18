import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

// Define the Zod schema for the structured response
export const messageCategoriesSchema = z.object({
  matched_category: z.string().optional().default('None'), // The matched category
})

// Create a structured output parser
export const parser = StructuredOutputParser.fromZodSchema(
  messageCategoriesSchema
)


export const systemPrompt = ChatPromptTemplate.fromTemplate(`
      You are an expert in categorizing messages.
      Your task is to match the provided message to one of the following categories: {categories}.
      The message may be in different languages.
      It is crucial that you only select a category from the provided list.
      If no match is found, or if the match is ambiguous, return "None".
      It is critical to double-check your work before returning the final result.
      Respond exclusively with a valid JSON object with the following key: matched_category.
  
      Input:
      {input}
      `)
