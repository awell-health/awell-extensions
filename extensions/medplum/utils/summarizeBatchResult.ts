import { type DataPointDefinition } from '@awell-health/extensions-core'
import { type Bundle } from '@medplum/fhirtypes'

const LOCATION = /(?:^|\/)([^/]+)\/([^/]+)(?:\/|$)/

/** The data points `summarizeBundleResult` fills: what the result is, not what is in it. */
export const bundleResultDataPoints = {
  bundleId: { key: 'bundleId', valueType: 'string' },
  bundleType: { key: 'bundleType', valueType: 'string' },
} satisfies Record<string, DataPointDefinition>

/**
 * The data points `summarizeBatchResult` fills. The last two grow with the
 * number of entries, so an action whose bundle can be large leaves them out and
 * returns only `bundleResultDataPoints`.
 */
export const batchResultDataPoints = {
  ...bundleResultDataPoints,
  resourceIds: { key: 'resourceIds', valueType: 'string' },
  resourcesCreated: { key: 'resourcesCreated', valueType: 'json' },
} satisfies Record<string, DataPointDefinition>

/** The id and type of an executed bundle's result. */
export const summarizeBundleResult = (
  result: Bundle,
): { bundleId: string; bundleType: string } => ({
  bundleId: result.id ?? '',
  bundleType: result.type ?? '',
})

/**
 * The data points that describe what Medplum did with an executed bundle: the
 * id of every resource it touched, and for each its type, status and location.
 */
export const summarizeBatchResult = (
  result: Bundle,
): {
  bundleId: string
  resourceIds: string
  bundleType: string
  resourcesCreated: string
} => {
  const resourceIds =
    result.entry
      ?.map((entry) => {
        if (
          entry.response?.location !== undefined &&
          entry.response.location !== ''
        ) {
          const match = entry.response.location.match(LOCATION)
          return match !== null ? match[2] : undefined
        }
        return entry.resource?.id
      })
      .filter((id): id is string => id !== undefined && id !== '')
      .join(',') ?? ''

  const resourcesCreated =
    result.entry
      ?.map((entry) => {
        let id: string | undefined
        let resourceType: string | undefined
        let location: string | undefined

        if (
          entry.response?.location !== undefined &&
          entry.response.location !== ''
        ) {
          const match = entry.response.location.match(LOCATION)
          if (match !== null) {
            resourceType = match[1]
            id = match[2]
            location = `${resourceType}/${id}`
          }
        }

        if (
          (id === undefined || id === '') &&
          entry.resource?.id !== undefined &&
          entry.resource.id !== ''
        ) {
          id = entry.resource.id
        }
        if (
          (resourceType === undefined || resourceType === '') &&
          entry.resource?.resourceType !== undefined
        ) {
          resourceType = entry.resource.resourceType
        }
        if (
          (location === undefined || location === '') &&
          resourceType !== undefined &&
          resourceType !== '' &&
          id !== undefined &&
          id !== ''
        ) {
          location = `${resourceType}/${id}`
        }

        return {
          id: id ?? '',
          resourceType: resourceType ?? '',
          status: entry.response?.status ?? '',
          location: location ?? '',
        }
      })
      .filter((resource) => resource.id !== '') ?? []

  return {
    ...summarizeBundleResult(result),
    resourceIds,
    resourcesCreated: JSON.stringify(resourcesCreated),
  }
}
