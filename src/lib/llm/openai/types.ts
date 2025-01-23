import type { ChatOpenAI } from '@langchain/openai'
import type { OPENAI_MODELS } from './constants'
import { type Pathway, type Patient } from '@awell-health/extensions-core'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'

// This ensures modelType only accepts the exact values from OPENAI_MODELS
export type OpenAIModelType = typeof OPENAI_MODELS[keyof typeof OPENAI_MODELS]

export interface CreateOpenAIModelConfig {
  /** Extension settings containing potential custom API key */
  settings: {
    openAiApiKey?: string  // Changed from complex object to optional string
  }
  /** Awell helpers providing default OpenAI configuration */
  helpers: {
    getOpenAIConfig: () => { apiKey: string }
  }
  /** Action payload containing context information */
  payload: {
    pathway: Pathway
    activity: Activity
    patient: Patient
    settings: {
      openAiApiKey?: string
    }
  }
  /** Which OpenAI model to use */
  modelType?: OpenAIModelType
}

/**
 * Standard metadata structure for AI actions tracking
 * Used for LangSmith tracing and analytics
 */
export interface AIActionMetadata {
  care_flow_definition_id: string
  care_flow_id: string
  activity_id: string
  [key: string]: unknown
}

export interface OpenAIModelConfig {
  /** Configured LangChain ChatOpenAI instance */
  model: ChatOpenAI
  /** Tracing metadata for LangChain calls */
  metadata: AIActionMetadata
}