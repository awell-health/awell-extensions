import { getPatient } from '.'
import { generateTestPayload } from '../../../../src/tests'
import { mockSettings } from '../../mocks'

// jest.mock('../../api/client')

describe('Medplum - Get patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return a patient', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '56529',
      },
      settings: mockSettings,
    })

    await getPatient.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: 'hello',
      },
    })
  })
})
