import { generateTestPayload } from '@/tests'
import {
  mockedAppointmentData,
  mockedAppointmentId,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { createAppointment } from './createAppointment'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createAppointment', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createAppointment)
  const payload = {
    settings: mockedSettings,
    fields: {
      appointmentData: JSON.stringify(mockedAppointmentData),
    },
  }

  it('should create appointment', async () => {
    await createAppointment.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { appointmentId: mockedAppointmentId },
    })
  })
})
