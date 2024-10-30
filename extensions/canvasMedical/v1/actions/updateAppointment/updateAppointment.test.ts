import { generateTestPayload } from '@/tests'
import {
  mockedAppointmentId,
  mockedAppointmentResource,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { updateAppointment } from './updateAppointment'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('updateAppointment', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      appointmentData: JSON.stringify(mockedAppointmentResource),
    },
  }

  it('should update appointment', async () => {
    await updateAppointment.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { appointmentId: mockedAppointmentId },
    })
  })
})
