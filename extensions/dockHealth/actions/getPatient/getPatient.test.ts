import { getPatient } from '.'
import { generateTestPayload } from '@/tests'
import { mockGetPatientResponse, mockSettings } from '../../api/__mocks__'

jest.mock('../../api/client')

describe('Dock Health - Get patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        dockPatientId: 'some-patient-id',
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
        firstName: mockGetPatientResponse.firstName,
        lastName: mockGetPatientResponse.lastName,
      },
    })
  })
})
