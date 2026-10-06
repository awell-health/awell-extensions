import { type DataPointDefinition } from '@awell-health/extensions-core'
import { type Bundle } from '@medplum/fhirtypes'

const LOCATION = /(?:^|\/)([^/]+)\/([^/]+)(?:\/|$)/

/** The data points `summarizeBatchResult` fills, for each action that returns them. */
export const batchResultDataPoints = {
  bundleId: { key: 'bundleId', valueType: 'string' },
  bundleType: { key: 'bundleType', valueType: 'string' },
  resourceIds: { key: 'resourceIds', valueType: 'string' },
  resourcesCreated: { key: 'resourcesCreated', valueType: 'json' },
} satisfies Record<string, DataPointDefinition>

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
    bundleId: result.id ?? '',
    resourceIds,
    bundleType: result.type ?? '',
    resourcesCreated: JSON.stringify(resourcesCreated),
  }
}
