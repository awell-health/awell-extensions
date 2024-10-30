import { generateTestPayload } from '@/tests'
import {
  mockedAppointmentData,
  mockedAppointmentId,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { createAppointment } from './createAppointment'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createAppointment', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      appointmentData: JSON.stringify(mockedAppointmentData),
    },
  }

  it('should create appointment', async () => {
    await createAppointment.onActivityCreated!(
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
