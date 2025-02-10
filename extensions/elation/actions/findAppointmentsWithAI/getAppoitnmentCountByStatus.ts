

import { type AppointmentResponse } from 'extensions/elation/types'
import { statusEnum } from '../../validation/appointment.zod'

export const getAppointmentCountsByStatus = (
    appointments: AppointmentResponse[],
  ): Record<string, number> => {
    return Object.values(statusEnum.Values).reduce<Record<string, number>>((acc, status) => {
      const cnt = appointments.filter(
        (appointment) => appointment?.status.status === status
      ).length
      if (cnt > 0) {
        acc[status] = cnt
      }
      return acc
    }, {})
  }
