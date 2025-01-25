import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { medicationFromImage } from '.'
import { ExtractMedicationResponse } from '../../types'

describe('Medication From Image', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(medicationFromImage)

  beforeEach(() => {
    clearMocks()
    jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    jest.restoreAllMocks()
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

    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: 'Ok',
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } satisfies Partial<Response>)

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          imageUrl:
            'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726601981/hackathon-sep-2024/seqn5izsagvs5nlferlf.png',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://medication-extractor-390819626634.us-central1.run.app/medication_extractor/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      })
    )

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

    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: 'Ok',
      ok: true,
      json: jest.fn().mockResolvedValue(mockErrorResponse),
    } satisfies Partial<Response>)

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          imageUrl:
            'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726601981/hackathon-sep-2024/invalid-url.png',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://medication-extractor-390819626634.us-central1.run.app/medication_extractor/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      })
    )

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: {
            en: '500 (ERROR): {"status":"ERROR","medications":[],"error_explanation":"Invalid image URL"}',
          },
          error: {
            category: 'SERVER_ERROR',
            message:
              '500 (ERROR): {"status":"ERROR","medications":[],"error_explanation":"Invalid image URL"}',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should handle native fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 404,
      statusText: 'Not found',
      ok: false,
    } satisfies Partial<Response>)

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          imageUrl:
            'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726601981/hackathon-sep-2024/invalid-url.png',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://medication-extractor-390819626634.us-central1.run.app/medication_extractor/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      })
    )

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: {
            en: '404 (Not found): ',
          },
          error: {
            category: 'SERVER_ERROR',
            message: '404 (Not found): ',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
