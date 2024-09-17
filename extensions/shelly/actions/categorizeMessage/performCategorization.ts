import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from 'langchain/output_parsers'
import { ChatOpenAI } from "@langchain/openai";
import { z } from 'zod'

// TODO dummy approach: improvements needed all around
// Initialize the OpenAI LLM using LangChain
const llm = new ChatOpenAI({
  modelName: 'gpt-4o', // TODO
  openAIApiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your environment
  temperature: 0, // To ensure consistency
})

// Define the Zod schema for the structured response
const messageCategoriesSchema = z.object({
  matched_entity: z.string().optional().default("None"), // The matched category
})

// Create a structured output parser
const parser = StructuredOutputParser.fromZodSchema(messageCategoriesSchema)

// Update the prompt to enforce a structured JSON response
const systemPrompt = ChatPromptTemplate.fromTemplate(`
    You are an expert in categorizing messages. Your task is to match the provided message to one of the following categories: {categories}.
    If no match is found, return "None."
    
    Please respond with a valid JSON object with the following key: matched_entity.
    

    Input:
    {input}
    `)

/**
 * Categorizes a message based on the provided categories using LangChain.
 * @param message - The message to categorize.
 * @param categories - The list of categories to match against.
 * @returns The category or 'None' if no match is found.
 */
export async function categorizeMessageWithLLM(message: string, categories: string[]): Promise<string> {
    try {
        const prompt = await systemPrompt.format({ 
            categories: categories.concat('None').join(', '),
            input: message 
        });

        const chain = llm.pipe(parser);
        console.log('Prompt:', prompt)
        const result = await chain.invoke(prompt);

        const matchedEntity = result.matched_entity ?? 'None';
        console.log('I am matching:', matchedEntity)

        // Ensure that the returned matched entity is valid
        return categories.includes(matchedEntity) ? matchedEntity : 'None';

    } catch (error) {
        console.error('Error categorizing message:', error);
        return 'None';
    }
}
