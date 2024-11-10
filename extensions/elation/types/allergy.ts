import { type z } from 'zod'
import { type allergySchema } from '../validation/allergy.zod'

export type CreateAllergyInput = z.infer<typeof allergySchema>

export interface CreateAllergyResponse extends CreateAllergyInput {
  id: number
}
