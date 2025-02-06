import { type AppointmentResponse } from "extensions/elation/types"

export const formatAppointments = (appointments: AppointmentResponse[]): string => {
    return appointments
      .map((appointment) => {
        const relevantInfo = {
          id: appointment.id,
          reason: appointment.reason,
          duration: appointment.duration,
          scheduled_date: appointment.scheduled_date,
        }
        return JSON.stringify(relevantInfo)
      })
      .join('\n\n')
  }