import { addDays } from 'date-fns'
import { type AppointmentResponse } from '../../../types'
import { type DeepPartial } from '../../../../../src/lib/types'

const now = new Date()

export const appointmentsMock = [
  {
    id: 123,
    scheduled_date: addDays(now, 1).toISOString(),
    reason: 'PCP: Est. Patient Office',
    mode: 'VIDEO',
    status: {
      status: 'Scheduled',
    },
    patient: 12345,
    physician: 141114870071298,
    practice: 141114865745924,
  },
  {
    id: 456,
    scheduled_date: addDays(now, 2).toISOString(),
    mode: 'VIDEO',
    reason: 'PCP: Est. Patient Office',
    status: {
      status: 'Scheduled',
    },
    patient: 12345,
    physician: 141114870071298,
    practice: 141114865745924,
  },
] satisfies Array<DeepPartial<AppointmentResponse>>
