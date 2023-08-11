import { updateAppointment } from '../updateAppointment'
import { appointmentResource } from '../../__mocks__/appointment'
import { generateTestPayload } from '../../../../src/tests'
import { makeAPIClient } from '../../client'
import { mockMakeAPIClient } from '../../__mocks__/canvasApiClient'

jest.mock('../../client')

describe('updateAppointment', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: {
      client_id: '123',
      client_secret: '123',
      base_url: 'https://example.com',
      auth_url: 'https://example.com/auth/token',
      audience: undefined,
    },
    fields: {
      appointment_data: JSON.stringify(appointmentResource),
    },
  }
  beforeAll(async () => {
    ;(makeAPIClient as jest.Mock).mockImplementation(mockMakeAPIClient)
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should update appointment', async () => {
    await updateAppointment.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
