import { generateTestPayload } from '@/tests'
import {
  mockedAppointmentId,
  mockedAppointmentResource,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { getAppointment } from './getAppointment'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('getAppointment', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getAppointment)
  const payload = {
    settings: mockedSettings,
    fields: {
      appointmentId: mockedAppointmentId,
    },
  }

  it('should get appointment', async () => {
    await getAppointment.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentData: JSON.stringify(mockedAppointmentResource),
      },
    })
  })
})
