import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { getAppointment } from '../getAppointment'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('getAppointment action', () => {
  const onComplete = jest.fn()
  const newActivityPayload = {
    pathway: {
      id: 'pathway-id',
      definition_id: 'pathway-definition-id',
    },
    activity: {
      id: 'activity-id',
    },
    patient: { id: 'test-patient' },
    fields: {
      appointmentId: 'appointment-1',
    },
    settings: {
      apiKey: 'apiKey',
      apiUrl: 'test-url',
    },
  }
  const appointmentWithNoDate = {
    id: 'appointment-1',
    appointment_type: {
      id: 'appointment-type-1',
      name: 'Appointment type',
    },
    contact_type: 'contact-type',
    user: {
      id: 'user-id',
    },
  }
  const appointmentWithDate = {
    ...appointmentWithNoDate,
    date: '2023-06-05 14:10:00 +0200',
  }

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should handle an appointment with no date set', async () => {
    mockGetSdkReturn.getAppointment.mockReturnValueOnce({
      data: {
        appointment: appointmentWithNoDate,
      },
    })

    await getAppointment.onActivityCreated(
      newActivityPayload,
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.getAppointment).toHaveBeenCalledWith({
      id: 'appointment-1',
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentTypeId: appointmentWithNoDate.appointment_type.id,
        appointmentTypeName: appointmentWithNoDate.appointment_type.name,
        contactType: appointmentWithNoDate.contact_type,
        date: undefined,
        patientId: appointmentWithNoDate.user.id,
      },
    })
  })

  test('Should handle an appointment with a date set', async () => {
    mockGetSdkReturn.getAppointment.mockReturnValueOnce({
      data: {
        appointment: appointmentWithDate,
      },
    })

    await getAppointment.onActivityCreated(
      newActivityPayload,
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.getAppointment).toHaveBeenCalledWith({
      id: 'appointment-1',
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentTypeId: appointmentWithNoDate.appointment_type.id,
        appointmentTypeName: appointmentWithNoDate.appointment_type.name,
        contactType: appointmentWithNoDate.contact_type,
        date: '2023-06-05T12:10:00Z',
        patientId: appointmentWithNoDate.user.id,
      },
    })
  })
})
