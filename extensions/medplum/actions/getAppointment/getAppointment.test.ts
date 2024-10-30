import { getAppointment } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings, mockAppointmentResponse } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Get appointment', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return an appointment', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentId: '3e471b29-eec4-47e0-86f1-cec848658417',
      },
      settings: mockSettings,
    })

    await getAppointment.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentData: JSON.stringify(mockAppointmentResponse),
      },
    })
  })
})
