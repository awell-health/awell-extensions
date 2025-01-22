
import { type SettingsType } from '../../settings'
import { makeAPIClient } from '../../client'

import { type AppointmentResponse } from 'extensions/elation/types'


export const getFutureAppointments = async (elationSettings: SettingsType, patientId: number): Promise<AppointmentResponse[]> => {
  const api = makeAPIClient(elationSettings)

  const appointments = await api.findAppointments({
    patient: patientId,
    from_date: new Date().toISOString(),
  })
  return appointments.filter(
    (appointment) =>
      appointment.status.status === 'Scheduled' ||
      appointment.status.status === 'Confirmed',
  )
}
