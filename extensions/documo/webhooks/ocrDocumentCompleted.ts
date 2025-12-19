import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { extractPatientInfoFromOCR } from './lib'

const dataPoints = {
  webhookData: {
    key: 'webhookData',
    valueType: 'json',
  },
  extractedInfo: {
    key: 'extractedInfo',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

/**
 * OCR Document Completed webhook payload
 * Event type: ocr.v1.document.complete
 * @see https://next.docs.documo.com/
 */
export interface OcrDocumentCompletedPayload {
  id: string
  accountId: string
  wsDocId: string
  status: string
  pagesCount: number
  createdAt: string
  completedAt: string
  ocrData?: {
    text: string
  }
}

export const ocrDocumentCompleted: Webhook<
  keyof typeof dataPoints,
  OcrDocumentCompletedPayload
> = {
  key: 'ocrDocumentCompleted',
  dataPoints,
  onEvent: async ({
    payload: { payload },
    onSuccess,
    onError,
    helpers: { getOpenAIConfig },
  }) => {
    const ocrText = payload.ocrData?.text ?? ''

    // Get OpenAI API key from configuration
    const { apiKey } = getOpenAIConfig()

    // Extract patient information from OCR text using LLM
    let extractedInfo
    try {
      extractedInfo = await extractPatientInfoFromOCR({
        apiKey,
        ocrText,
      })
    } catch (error) {
      await onError({
        response: {
          statusCode: 500,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to extract patient information from OCR text',
        },
      })
      return
    }

    await onSuccess({
      data_points: {
        webhookData: JSON.stringify(payload),
        extractedInfo: JSON.stringify(extractedInfo),
      },
      // Use the patient hash as the patient identifier for matching
      ...(extractedInfo.patient_identifier_hash != null
        ? {
            patient_identifier: {
              system: 'documo-ocr-hash',
              value: extractedInfo.patient_identifier_hash,
            },
          }
        : {}),
    })
  },
}

export type OcrDocumentCompleted = typeof ocrDocumentCompleted
