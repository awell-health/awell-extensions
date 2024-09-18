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

// TODO: move prompt to LangSmith + further tune
export const systemPrompt = ChatPromptTemplate.fromTemplate(`
      You are an expert in categorizing messages different messages in a clinical context.
      Use your expertise to solve the critical task:
      1. Match the provided message to one of the following categories: {categories}.
      2. Provide a one-sentence explanation of why the message fits the chosen category.
      
      Instructions for categorization:
      - The message may be in different languages.
      - It is crucial that you only select a category from the provided list.
      - If no match is found, or if the match is ambiguous, return "None".
      It is critical to double-check your work before returning the final result.
      
      Respond exclusively with a valid JSON object containing the following keys:
      - matched_category: The selected category or "None".
      - match_explanation: A one-sentence explanation of the match. Make sure to provide clear and concise explanation to justify your decision.
  
      Input:
      {input}
      `)
