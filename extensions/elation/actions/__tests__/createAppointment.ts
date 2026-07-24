import { appointmentExample } from '../../__mocks__/constants'
import { createAppointment } from '../createAppointment'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Simple create appointment action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createAppointment)
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    clearMocks()
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
    await createAppointment.onEvent!({
      payload: generateTestPayload({
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
      } as any),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentId: '1',
      },
    })
  })
})
