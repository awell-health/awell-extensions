import { type z } from 'zod'
import { type labOrderSchema } from '../validation/labOrder.zod'

export type CreateLabOrderInput = z.infer<typeof labOrderSchema>

export interface CreateLabOrderResponse extends CreateLabOrderInput {
  id: number
  printable_view: string
}
