import { type ExtractMedicationResponse } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'lodash'

export class FetchError extends Error {
  statusCode: number
  statusText: string
  responseBody: string

  constructor(statusCode: number, statusText: string, responseBody?: unknown) {
    super(`${statusCode} ${statusText}`)
    this.statusCode = statusCode
    this.statusText = statusText
    this.responseBody = isEmpty(responseBody)
      ? ''
      : JSON.stringify(responseBody)
  }
}

export class MedicationExtractorApi {
  private readonly baseUrl =
    'https://medication-extractor-390819626634.us-central1.run.app'

  private constructUrl(url: string): string {
    return `${this.baseUrl}${url}`
  }

  async extractMedicationFromImage({
    imageUrl,
    context,
  }: {
    imageUrl: string
    context?: {
      pathwayId: string
      activityId: string
    }
  }): Promise<ExtractMedicationResponse> {
    const url = this.constructUrl(`/medication_extractor/`)
    const request_id = uuidv4()

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Request-ID': request_id,
      },
      body: JSON.stringify({
        image_url: imageUrl,
        context: {
          pathway_id: context?.pathwayId,
          activity_id: context?.activityId,
          request_id,
        },
      }),
    })

    // Promise resolved and HTTP status is successful
    if (response.ok) {
      const res = (await response.json()) as ExtractMedicationResponse

      // API-specific error handling
      if (res.status !== 'OK') {
        throw new FetchError(500, res.status, res)
      }

      return res
    } else {
      // Promise resolved but HTTP status failed (handle server errors like 404 or 500)
      throw new FetchError(response.status, response.statusText, response.body)
    }
  }
}

export default MedicationExtractorApi
