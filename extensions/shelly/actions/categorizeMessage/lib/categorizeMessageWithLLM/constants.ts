import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

// Define the Zod schema for the structured response
export const messageCategoriesSchema = z.object({
  matched_entity: z.string().optional().default('None'), // The matched category
})

// Create a structured output parser
export const parser = StructuredOutputParser.fromZodSchema(
  messageCategoriesSchema
)

// Update the prompt to enforce a structured JSON response
export const systemPrompt = ChatPromptTemplate.fromTemplate(`
      You are an expert in categorizing messages. Your task is to match the provided message to one of the following categories: {categories}.
      If no match is found, return "None."
      
      Please respond with a valid JSON object with the following key: matched_entity.
      
  
      Input:
      {input}
      `)
