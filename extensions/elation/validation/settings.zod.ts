import { z } from 'zod'

export const settingsSchema = z.object({
    base_url: z.string({ errorMap: () => ({ message: 'Missing base_url' }) }).min(1),
    auth_url: z.string({ errorMap: () => ({ message: 'Missing auth_url' }) }).min(1),
    client_id: z.string({ errorMap: () => ({ message: 'Missing client_id' }) }).min(1),
    client_secret: z.string({ errorMap: () => ({ message: 'Missing client_secret' }) }).min(1),
    username: z.string({ errorMap: () => ({ message: 'Missing username' }) }).min(1),
    password: z.string({ errorMap: () => ({ message: 'Missing password' }) }).min(1),
})