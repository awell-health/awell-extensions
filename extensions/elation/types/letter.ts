import { type z } from 'zod'
import { type letterSchema } from '../validation/letter.zod'

export type PostLetterInput = z.infer<typeof letterSchema>

export interface PostLetterResponse extends PostLetterInput {
  id: number
}
