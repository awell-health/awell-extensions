import { createPatient } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings, mockCreatePatientResponse } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Create patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        firstName: 'Awell',
        lastName: 'Demo',
        mobilePhone: '+1 888 206 20 11',
        email: 'test@awellhealth.com',
        birthDate: '1993-11-30',
        gender: 'male',
        address: 'Awell Street',
        city: 'Awell City',
        postalCode: '1111',
        state: 'Awell State',
        country: 'Awellien',
      },
      patient: {
        id: 'test-id',
      },
      settings: mockSettings,
    })

    await createPatient.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientId: mockCreatePatientResponse.id,
      },
    })
  })
})
