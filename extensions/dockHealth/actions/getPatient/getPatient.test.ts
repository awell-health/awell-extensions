import { getPatient } from '.'
import { generateTestPayload } from '@/tests'
import { mockGetPatientResponse, mockSettings } from '../../api/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../api/client')

describe('Dock Health - Get patient', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getPatient)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        dockPatientId: 'some-patient-id',
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
        firstName: mockGetPatientResponse.firstName,
        lastName: mockGetPatientResponse.lastName,
      },
    })
  })
})
