import { ChatOpenAI } from '@langchain/openai'
import { createHash } from 'crypto'
import { parser, type PatientInfo } from './parser'
import { systemPrompt } from './prompt'

const MAX_RETRIES = 3

export interface ExtractPatientInfoConfig {
  apiKey: string
  ocrText: string
}

export interface ExtractedPatientInfo extends PatientInfo {
  /** SHA-256 hash of normalized firstName|lastName|dob for patient matching */
  patient_identifier_hash: string | null
}

/**
 * Generates a deterministic patient identifier hash from first name, last name, and DOB.
 * Returns null if any required field is missing.
 *
 * @param firstName - Patient's first name
 * @param lastName - Patient's last name
 * @param dob - Patient's date of birth (YYYY-MM-DD)
 * @returns SHA-256 hash or null if fields are missing
 */
export function generatePatientHash(
  firstName: string | null,
  lastName: string | null,
  dob: string | null,
): string | null {
  if (firstName == null || lastName == null || dob == null) {
    return null
  }

  // Normalize: lowercase, trim whitespace
  const normalizedFirstName = firstName.toLowerCase().trim()
  const normalizedLastName = lastName.toLowerCase().trim()
  const normalizedDob = dob.trim()

  // Create a deterministic string to hash
  const dataToHash = `${normalizedFirstName}|${normalizedLastName}|${normalizedDob}`

  // Generate SHA-256 hash
  return createHash('sha256').update(dataToHash).digest('hex')
}

/**
 * Extracts patient information from OCR text using an LLM.
 *
 * Uses GPT-4o-mini for cost-effective extraction with good accuracy.
 * Includes retry logic for parsing failures.
 *
 * @param config - Configuration including API key and OCR text
 * @returns Extracted patient information with identifier hash
 */
export async function extractPatientInfoFromOCR(
  config: ExtractPatientInfoConfig,
): Promise<ExtractedPatientInfo> {
  const { apiKey, ocrText } = config

  // Initialize the model
  const model = new ChatOpenAI({
    modelName: 'gpt-4o-mini-2024-07-18',
    openAIApiKey: apiKey,
    temperature: 0, // Deterministic output for data extraction
    maxRetries: 5,
    timeout: 60000, // 60 second timeout for potentially long documents
  })

  // Format the prompt with the OCR text
  const prompt = await systemPrompt.format({
    ocrText,
  })

  // Create the chain with structured output parsing
  const chain = model.pipe(parser)

  // Retry logic for LLM calls
  let result: PatientInfo | null = null
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      result = await chain.invoke(prompt, {
        runName: 'DocumoExtractPatientInfo',
      })
      break // Success, exit retry loop
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      // Continue to next retry
    }
  }

  if (result == null) {
    throw new Error(
      `Failed to extract patient information after ${MAX_RETRIES} attempts: ${lastError?.message ?? 'Unknown error'}`,
    )
  }

  // Generate the patient identifier hash
  const patient_identifier_hash = generatePatientHash(
    result.patient_first_name,
    result.patient_last_name,
    result.patient_dob,
  )

  return {
    ...result,
    patient_identifier_hash,
  }
}
