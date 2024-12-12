import { type z } from 'zod'
import { type careGapSchema } from '../validation/careGap.zod'

export type CareGap = z.infer<typeof careGapSchema>

export type CareGapResponse = CareGap

export type PostCareGapInput = Pick<CareGap, 
  | 'definition_id'
  | 'patient_id'
  | 'practice_id'
  | 'detail'
  | 'quality_program'
  | 'created_date'
  | 'status'
>

export type CloseCareGapInput = Pick<CareGap, 'quality_program'> & {
  caregap_id: string
  status: 'closed'
}