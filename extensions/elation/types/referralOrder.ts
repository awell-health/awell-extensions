import { type z } from 'zod'
import { type referralOrderSchema } from '../validation/referralOrder.zod'

export type GetReferralOrderInputType = number

export type GetReferralOrderResponseType = z.infer<
  typeof referralOrderSchema
> & {
  id: number
}

export type PostReferralOrderInput = Pick<
  z.infer<typeof referralOrderSchema>,
  | 'authorization_for'
  | 'auth_number'
  | 'consultant_name'
  | 'short_consultant_name'
  | 'date_for_reEval'
  | 'practice'
  | 'patient'
  | 'icd10_codes'
  | 'specialty'
  | 'resolution'
>

export interface PostReferralOrderResponse extends PostReferralOrderInput {
  id: number
}
