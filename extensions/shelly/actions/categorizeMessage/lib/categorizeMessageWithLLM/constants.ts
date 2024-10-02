import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

// Define the Zod schema for the structured response
export const messageCategoriesSchema = z.object({
  matched_category: z.string().optional().default('None'), // The matched category
  match_explanation: z.string(), // One-sentence explanation of the match
})

// Create a structured output parser
export const parser = StructuredOutputParser.fromZodSchema(
  messageCategoriesSchema
)

export const systemPrompt = ChatPromptTemplate.fromTemplate(`
      You are an expert in categorizing different patient messages in a clinical context.
      Use your expertise to solve the message categorization task:
      1. Categorize the input message into **one of the provided categories**: {categories}. If no category fits, return "None".
      2. Provide a concise explanation of why the message belongs to the selected category.
      
      Important Instructions:
      - The message may be in multiple languages.
      - **Only** choose from the provided list of categories. **Do not create new categories** or alter the given ones.
      - If no category fits perfectly, or if the match is unclear, return "None" without guessing.
      - Carefully verify your selection before submitting your answer.
      
      Respond exclusively with a valid JSON object containing the following keys:
      - matched_category: The most suitable category. Must be from the following list: {categories} - None if no category fits. Absolutely refrain from creating new categories or altering existent one. Output should be one of the provided categories in the list.
      - match_explanation: A brief explanation supporting your decision.
  
      Input:
      {input}
      `)
