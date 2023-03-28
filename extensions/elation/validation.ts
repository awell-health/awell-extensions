import { z } from 'zod'

export const Settings = z.object({
  client_id: z.string().min(1, { message: 'Missing client_id' }),
  client_secret: z.string().min(1, { message: 'Missing client_secret' }),
  username: z.string().min(1, { message: 'Missing username' }),
  password: z.string().min(1, { message: 'Missing password' }),
})

export const PatientId = z.coerce
  .number({
    invalid_type_error: 'Requires a valid patient ID (number)',
  })
  .gt(0, { message: 'Requires a valid patient ID (number)' })

export const FirstName = z.string().min(1)
export const LastName = z.string().min(1)
export const DOB = z.string().min(1)
export const CaregiverPractice = z.coerce
  .number({
    invalid_type_error: 'Requires a valid caregiver practice ID',
  })
  .gt(0, { message: 'Requires a valid caregiver practice ID' })
export const PrimaryPhysician = z.coerce
  .number({
    invalid_type_error: 'Requires a valid primary physician ID',
  })
  .gt(0, { message: 'Requires a valid primary physician ID' })
export const Sex = z.string().min(1)
