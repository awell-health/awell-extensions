import { generateTestPayload } from '@/tests'
import {
  mockedAppointmentId,
  mockedAppointmentResource,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { getAppointment } from './getAppointment'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('getAppointment', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      appointmentId: mockedAppointmentId,
    },
  }

  it('should get appointment', async () => {
    await getAppointment.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentData: JSON.stringify(mockedAppointmentResource),
      },
    })
  })
})
