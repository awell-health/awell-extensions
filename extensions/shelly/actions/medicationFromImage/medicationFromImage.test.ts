import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { medicationFromImage } from '.'
import { MedicationExtractorApi } from '../../medicationExtractorApi'
import { ExtractMedicationResponse } from '../../types'

// Mock the MedicationExtractorApi
jest.mock('../../medicationExtractorApi')

describe('Medication From Image', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(medicationFromImage)

  const mockMedicationExtractorApi = MedicationExtractorApi as jest.MockedClass<
    typeof MedicationExtractorApi
  >

  beforeEach(() => {
    clearMocks()
    mockMedicationExtractorApi.mockClear()
  })

  test('Should handle successful medication extraction', async () => {
    const mockResponse: ExtractMedicationResponse = {
      status: 'OK',
      medications: [
        {
          product_rxcui: '809854',
          product_name:
            'hydrochlorothiazide 12.5 MG / quinapril 10 MG Oral Tablet [Accuretic]',
          brand_name: 'Accuretic',
          dose_form_name: 'Oral Tablet',
          prescribable_name: 'Accuretic 10 MG / 12.5 MG Oral Tablet',
          extracted_medication_name: 'Accuretic',
          extracted_brand_name: 'Accuretic',
          extracted_dosage: '10 mg / 12.5 mg',
          extracted_ndcg: '0006-0711-31',
        },
      ],
    }

    mockMedicationExtractorApi.prototype.extractMedicationFromImage.mockResolvedValue(
      mockResponse
    )

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          imageUrl:
            'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726601981/hackathon-sep-2024/seqn5izsagvs5nlferlf.png',
        },
        settings: {
          openAiApiKey: 'a',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        data: JSON.stringify({
          medications: mockResponse.medications,
        }),
      },
    })
  })

  test('Should handle API error response', async () => {
    const mockErrorResponse: ExtractMedicationResponse = {
      status: 'ERROR',
      medications: [],
      error_explanation: 'Invalid image URL',
    }

    mockMedicationExtractorApi.prototype.extractMedicationFromImage.mockResolvedValue(
      mockErrorResponse
    )

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          imageUrl:
            'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726601981/hackathon-sep-2024/invalid-url.png',
        },
        settings: {
          openAiApiKey: 'a',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Invalid image URL',
          },
          error: {
            category: 'BAD_REQUEST',
            message: 'Invalid image URL',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
