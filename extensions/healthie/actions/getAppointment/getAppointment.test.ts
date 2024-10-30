import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { getAppointment } from '../getAppointment'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('getAppointment action', () => {
  const onComplete = jest.fn()
  const newActivityPayload = generateTestPayload({
    fields: {
      appointmentId: 'appointment-1',
    },
    settings: {
      apiKey: 'apiKey',
      apiUrl: 'test-url',
    },
  })
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

  const appointmentWithStatus = {
    ...appointmentWithNoDate,
    date: '2023-06-05 14:10:00 +0200',
    pm_status: 'Cancelled',
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

    await getAppointment.onActivityCreated!(
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

    await getAppointment.onActivityCreated!(
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

  test('Should handle an appointment with a status', async () => {
    mockGetSdkReturn.getAppointment.mockReturnValueOnce({
      data: {
        appointment: appointmentWithStatus,
      },
    })

    await getAppointment.onActivityCreated!(
      newActivityPayload,
      onComplete,
      jest.fn()
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentTypeId: appointmentWithNoDate.appointment_type.id,
        appointmentTypeName: appointmentWithNoDate.appointment_type.name,
        contactType: appointmentWithNoDate.contact_type,
        date: '2023-06-05T12:10:00Z',
        patientId: appointmentWithNoDate.user.id,
        appointmentStatus: 'Cancelled',
      },
    })
  })
})
