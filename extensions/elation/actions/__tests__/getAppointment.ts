import { getAppointment } from '../getAppointment'
import { appointmentExample } from '../../__mocks__/constants'
import { isNil } from 'lodash'

jest.mock('../../client')

describe('Simple get appointment action', () => {
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
    await getAppointment.onActivityCreated!(
      {
        fields: {
          appointmentId: '1',
        },
        settings,
      } as any,
      onComplete,
      jest.fn()
    )
    const {
      patient,
      physician,
      practice,
      duration,
      service_location,
      scheduled_date,
      telehealth_details,
      metadata,
      status,
      ...appointmentFields
    } = appointmentExample
    expect(onComplete).toHaveBeenCalled()
    expect(onComplete).toBeCalledWith({
      data_points: expect.objectContaining({
        ...appointmentFields,
        scheduledDate: scheduled_date,
        telehealthDetails: telehealth_details,
        patientId: String(patient),
        physicianId: String(physician),
        practiceId: String(practice),
        duration: String(duration),
        serviceLocationId: String(service_location),
        ...(!isNil(status) && { status: JSON.stringify(status) }),
      }),
    })
  })
})
