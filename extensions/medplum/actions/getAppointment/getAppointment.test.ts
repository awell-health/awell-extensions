import { getAppointment } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings, mockAppointmentResponse } from '../../__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Get appointment', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getAppointment)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should return an appointment', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        appointmentId: '3e471b29-eec4-47e0-86f1-cec848658417',
      },
      settings: mockSettings,
    })

    await getAppointment.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentData: JSON.stringify(mockAppointmentResponse),
      },
    })
  })
})
