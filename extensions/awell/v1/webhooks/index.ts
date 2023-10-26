import { pathwayCompleted } from './pathwayCompleted'
import { startPathway } from './pathwayStart'

// We have to export this type for the declaration file, so the compiler can write an object type literal
// https://github.com/microsoft/TypeScript/issues/5711
export type { PathwayCompletedPayload } from './pathwayCompleted'
export type { StartPathwayPayload } from './pathwayStart'
export const webhooks = [pathwayCompleted, startPathway]
