import { type z } from 'zod'
import { type physicianSchema } from '../validation/physician.zod'

export type PhysicianInput = z.infer<typeof physicianSchema>

export interface PhysicianResponse extends PhysicianInput {
  id: number
  specialty?: string
  user_id: number
  practice: number
  is_active: boolean
}
