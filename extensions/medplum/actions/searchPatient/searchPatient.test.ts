import { searchPatient } from './searchPatient'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'
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
})
