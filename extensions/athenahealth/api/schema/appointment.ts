import z from 'zod'
import { AthenaDateOnlySchema } from './date'

export interface CreateAppointmentNoteResponseType {
  success: string
}

export const AppointmentSchema = z.object({
  appointmenttypeid: z.string(),
  appointmenttype: z.string(),
  patientappointmenttypename: z.string(),
  appointmentstatus: z.string(),
  departmentid: z.string(),
  providerid: z.string(),
  date: AthenaDateOnlySchema,
  patientid: z.string(),
  duration: z.number(),
  starttime: z.string(),
})

export type AppointmentSchemaType = z.infer<typeof AppointmentSchema>
