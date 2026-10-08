import { type DataPointDefinition } from '@awell-health/extensions-core'
import { bundleResultDataPoints } from '../../../utils'

export const dataPoints = {
  /** `bundleId` is for one bundle: a list of transactions has no single id, and returns none. */
  ...bundleResultDataPoints,
  /** How many bundles were sent to Medplum: 1 for a stored bundle, more for one that was split. */
  chunkCount: { key: 'chunkCount', valueType: 'number' },
  /** How many entries those bundles held, in all. */
  entryCount: { key: 'entryCount', valueType: 'number' },
} satisfies Record<string, DataPointDefinition>
