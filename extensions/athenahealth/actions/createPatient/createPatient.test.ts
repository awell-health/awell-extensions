import { createPatient } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../api/__mocks__/mockData'

jest.mock('../../api/client')

describe('athenahealth - Create patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
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

    await createPatient.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        createdPatientId: '1',
      },
    })
  })
})
