import { generateTestPayload } from '@/tests'
import {
  mockedAppointmentId,
  mockedAppointmentResource,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { updateAppointment } from './updateAppointment'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('updateAppointment', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updateAppointment)
  const payload = {
    settings: mockedSettings,
    fields: {
      appointmentData: JSON.stringify(mockedAppointmentResource),
    },
  }

  it('should update appointment', async () => {
    await updateAppointment.onEvent!({
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
