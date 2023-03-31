import { z } from 'zod'

export const numberId = z.coerce
    .number({
        invalid_type_error: 'Requires a valid ID (number)',
    })
    .positive({
        message: 'Requires a valid ID (number)',
    })

export const stringDate = z.coerce
    .date()
    .transform(arg => arg.toISOString().slice(0, 10))