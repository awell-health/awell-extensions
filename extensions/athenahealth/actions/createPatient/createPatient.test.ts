import { createPatient } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../api/__mocks__/mockData'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../api/client')

describe('athenahealth - Create patient', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createPatient)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        firstname: 'Nick',
        lastname: 'Hellemans',
        dob: '11/30/1993',
        email: 'nick@awellhealth.com',
        departmentid: '1',
      },
      settings: mockSettings,
    })

    await createPatient.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        createdPatientId: '1',
      },
    })
  })
})
