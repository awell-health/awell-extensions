/**
 * Types for the Guideway Care Observation Summarization API.
 * @see API Reference — POST /gwc_observation_summarization
 */

/** Request body for POST /gwc_observation_summarization */
export interface GwcSummarizationRequest {
  /** The full patient call transcript or interaction text. Required. */
  source_text: string
  /** Identifier for the care flow or pathway. */
  care_flow_id?: string
  /** ISO 8601 datetime. Defaults to current time. */
  processed_datetime?: string
  /** Type of source (e.g. phone_call, chat, note). */
  source_type?: string
  /** Unique identifier for the source. Auto-generated if omitted. */
  source_id?: string
  /** Key-value pairs matching active context parameters. Injected into the prompt as known context. */
  context?: Record<string, string>
}

/** A single observation from the analysis. */
export interface GwcSummarizationObservation {
  name: string
  display_name: string
  domain: string
  value_type: string
  value: string | null
  detail: string
  evidence: string
  confidence: 'high' | 'medium' | 'low'
}

/** Analysis block in the success response. */
export interface GwcSummarizationAnalysis {
  /** Brief overall summary of the call. */
  summary: string
  /** Array of observation objects, one per active topic. */
  observations: GwcSummarizationObservation[]
  /** HTML-formatted rich text covering all observation topics. */
  observations_summary_formatted: string
  /** HTML-formatted list of items needing follow-up. */
  followup_formatted: string
}

/** Token usage and cost in the success response. */
export interface GwcSummarizationTokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCost: number
}

/** Inner data payload of a successful response. */
export interface GwcSummarizationData {
  care_flow_id?: string
  processed_datetime?: string
  source_type?: string
  source_id?: string
  context?: Record<string, string>
  processedAt: string
  processingTimeMs: number
  prompt_version: number
  prompt_version_date?: string
  analysis: GwcSummarizationAnalysis
  tokenUsage: GwcSummarizationTokenUsage
}

/** Success response (200 OK). */
export interface GwcSummarizationSuccessResponse {
  status: 'success'
  data: GwcSummarizationData
}

/** Error response (400, 401, 500). */
export interface GwcSummarizationErrorResponse {
  status: 'error'
  message: string
}
