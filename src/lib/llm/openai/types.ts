import type { ChatOpenAI } from '@langchain/openai'
import type { OPENAI_MODELS } from './constants'
import { type Pathway, type Patient } from '@awell-health/extensions-core'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'

// This ensures modelType only accepts the exact values from OPENAI_MODELS
export type OpenAIModelType = typeof OPENAI_MODELS[keyof typeof OPENAI_MODELS]

// Define the minimal structure we need from the pathway
interface MinimalPathway {
  id?: string
  definition_id?: string
  tenant_id?: string
}

// Define the minimal structure we need from the activity
interface MinimalActivity {
  id?: string
}

// Define what we actually need from the payload
interface RequiredPayloadProperties {
  pathway: MinimalPathway
  activity: MinimalActivity
}

export interface CreateOpenAIModelConfig {
  /** Settings object that might contain an OpenAI API key */
  settings: {
    openAiApiKey?: string
    [key: string]: unknown
  }
  /** Helpers object that can provide a default OpenAI config */
  helpers: {
    getOpenAIConfig: () => { apiKey: string }
  }
  /** Payload containing the minimal required information */
  payload: RequiredPayloadProperties & Record<string, any>  // Changed to be more permissive
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
  metadata: {
    care_flow_definition_id: string
    care_flow_id: string
    activity_id: string
    tenant_id: string
  }
}