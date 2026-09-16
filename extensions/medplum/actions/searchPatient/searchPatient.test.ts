import { searchPatient } from './searchPatient'
import { generateTestPayload } from '@/tests'
import { mockSettings, NOT_FOUND_SEARCH_VALUE } from '../../__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Search patient', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(searchPatient)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should search for patient by parameter', async () => {
    const mockPayload = generateTestPayload({
      fields: {
        parameter: 'identifier',
        value: '12345',
        failIfNotFound: undefined,
      },
      settings: mockSettings,
    })

    await searchPatient.onEvent!({
      payload: mockPayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: expect.any(String),
        searchResults: expect.any(String),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should fail when no patient is found and failIfNotFound is true', async () => {
    const mockPayload = generateTestPayload({
      fields: {
        parameter: 'identifier',
        value: NOT_FOUND_SEARCH_VALUE,
        failIfNotFound: true,
      },
      settings: mockSettings,
    })

    await searchPatient.onEvent!({
      payload: mockPayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({ category: 'SERVER_ERROR' }),
        }),
      ],
    })
  })

  test('Should complete when no patient is found and failIfNotFound is false', async () => {
    const mockPayload = generateTestPayload({
      fields: {
        parameter: 'identifier',
        value: NOT_FOUND_SEARCH_VALUE,
        failIfNotFound: false,
      },
      settings: mockSettings,
    })

    await searchPatient.onEvent!({
      payload: mockPayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: 'null',
        searchResults: expect.any(String),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should default failIfNotFound to false when the field is not set', async () => {
    const mockPayload = generateTestPayload({
      fields: {
        parameter: 'identifier',
        value: NOT_FOUND_SEARCH_VALUE,
        failIfNotFound: undefined,
      },
      settings: mockSettings,
    })

    await searchPatient.onEvent!({
      payload: mockPayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: 'null',
        searchResults: expect.any(String),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should opt in to automated retries so a failed search is retried', () => {
    expect(searchPatient.supports_automated_retries).toBe(true)
  })
})
