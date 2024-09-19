import fetch from 'node-fetch'
import { ExtractMedicationResponse } from './types'

export class MedicationExtractorApi {
  private readonly baseUrl =
    'https://medication-extractor-390819626634.us-central1.run.app'

  private constructUrl(url: string): string {
    return `${this.baseUrl}${url}}`
  }

  async extractMedicationFromImage(
    imageUrl: string
  ): Promise<ExtractMedicationResponse> {
    const url = this.constructUrl(`/medication_extractor/`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
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
