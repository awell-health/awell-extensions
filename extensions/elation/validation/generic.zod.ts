import { z } from 'zod'

export const numberId = z.coerce.number().positive()
export const stringDate = z.coerce.date().transform(arg => arg.toISOString().slice(0, 10))