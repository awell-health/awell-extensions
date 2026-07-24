import { getPatient } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings, mockGetPatientResponse } from '../../__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Get patient', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getPatient)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: 'Patient/404bbc59-5b60-445d-808c-b2c7b2351d9b',
      },
      settings: mockSettings,
    })

    await getPatient.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: JSON.stringify(mockGetPatientResponse),
        patientFirstName: mockGetPatientResponse?.name?.[0]?.given?.[0],
        patientLastName: mockGetPatientResponse?.name?.[0]?.family,
        patientDob: mockGetPatientResponse?.birthDate,
        patientGender: mockGetPatientResponse?.gender,
      },
    })
  })
})
