import fetch from 'node-fetch'
import { ExtractMedicationResponse } from './types'
import { v4 as uuidv4 } from 'uuid'

export class MedicationExtractorApi {
  private readonly baseUrl =
    'https://medication-extractor-390819626634.us-central1.run.app'

  private constructUrl(url: string): string {
    return `${this.baseUrl}${url}}`
  }

  async extractMedicationFromImage(
    imageUrl: string,
    context?: {
      pathwayId: string
      activityId: string
    }
  ): Promise<ExtractMedicationResponse> {
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
    const result = await response.json()

    if (response.status >= 400) {
      throw new Error(
        result?.message ??
          'Unknown error in Medication Extractor API has occurred'
      )
    }

    return result
  }
}

export default MedicationExtractorApi
