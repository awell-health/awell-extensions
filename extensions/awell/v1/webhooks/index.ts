import { pathwayCompleted } from './pathwayCompleted'
import { pathwayStart } from './pathwayStart'

// We have to export this type for the declaration file, so the compiler can write an object type literal
// https://github.com/microsoft/TypeScript/issues/5711
export type { PathwayCompletedPayload } from './pathwayCompleted'
export type { PathwayStartPayload } from './pathwayStart'
export const webhooks = [pathwayCompleted, pathwayStart]
