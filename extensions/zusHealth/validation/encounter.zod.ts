import z from 'zod'

export const startsWithEncounter = z.string().startsWith('Encounter/')
