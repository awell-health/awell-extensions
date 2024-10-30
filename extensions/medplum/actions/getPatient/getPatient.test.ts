import { getPatient } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings, mockGetPatientResponse } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Get patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: 'Patient/404bbc59-5b60-445d-808c-b2c7b2351d9b',
      },
      settings: mockSettings,
    })

    await getPatient.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: JSON.stringify(mockGetPatientResponse),
      },
    })
  })
})
