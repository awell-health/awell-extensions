import { appointmentExample } from '../../__mocks__/constants'
import { createAppointment } from '../createAppointment'

jest.mock('../../client')

describe('Simple create appointment action', () => {
  const onComplete = jest.fn()
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should return with correct data_points', async () => {
    const {
      patient,
      physician,
      practice,
      scheduled_date,
      service_location,
      telehealth_details,
      ...appointment
    } = appointmentExample
    await createAppointment.onActivityCreated!(
      {
        fields: {
          ...appointment,
          patientId: patient,
          physicianId: physician,
          practiceId: practice,
          scheduledDate: scheduled_date,
          serviceLocationId: service_location,
          telehealthDetails: telehealth_details,
        },
        settings,
      } as any,
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentId: '1',
      },
    })
  })
})
