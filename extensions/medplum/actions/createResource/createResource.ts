import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { type Bundle } from '@medplum/fhirtypes'

export const createResource: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createResource',
  category: Category.EHR_INTEGRATIONS,
  title: 'Find or create resource',
  description:
    'Find or create any FHIR resource in Medplum. Optionally search for existing resources by type and identifier before creating. Supports single resources or FHIR Bundles (transaction/batch) for creating multiple resources atomically.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      fields: input,
      medplumSdk,
    } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const resourceData = JSON.parse(input.resourceJson)

      const shouldSearch =
        input.searchResourceType && input.searchIdentifier

      if (shouldSearch && input.searchResourceType && input.searchIdentifier) {
        const searchParams: Record<string, string> = {
          identifier: input.searchIdentifier,
        }

        const searchBundle = await medplumSdk.search(
          input.searchResourceType as any,
          searchParams
        )

        if (searchBundle.entry && searchBundle.entry.length > 0) {
          const latestResource =
            searchBundle.entry[searchBundle.entry.length - 1].resource

          if (latestResource) {
            await onComplete({
              data_points: {
                resourceId: latestResource.id ?? '',
                resourceType: latestResource.resourceType,
                wasResourceFound: 'true',
              },
            })
            return
          }
        }
      }

      if (resourceData.resourceType === 'Bundle') {
        const result = await medplumSdk.executeBatch(resourceData as Bundle)

        const resourceIds =
          result.entry
            ?.map((entry) => {
              if (entry.response?.location) {
                const match = entry.response.location.match(
                  /(?:^|\/)([^/]+)\/([^/]+)(?:\/|$)/
                )
                return match ? match[2] : undefined
              }
              return entry.resource?.id
            })
            .filter(Boolean)
            .join(',') ?? ''

        const resourcesCreated =
          result.entry
            ?.map((entry) => {
              let id: string | undefined
              let resourceType: string | undefined
              let location: string | undefined

              if (entry.response?.location) {
                const match = entry.response.location.match(
                  /(?:^|\/)([^/]+)\/([^/]+)(?:\/|$)/
                )
                if (match) {
                  resourceType = match[1]
                  id = match[2]
                  location = `${resourceType}/${id}`
                }
              }

              if (!id && entry.resource?.id) {
                id = entry.resource.id
              }
              if (!resourceType && entry.resource?.resourceType) {
                resourceType = entry.resource.resourceType
              }
              if (!location && resourceType && id) {
                location = `${resourceType}/${id}`
              }

              return {
                id: id ?? '',
                resourceType: resourceType ?? '',
                status: entry.response?.status ?? '',
                location: location ?? '',
              }
            })
            .filter((r) => r.id) ?? []

        await onComplete({
          data_points: {
            bundleId: result.id ?? '',
            resourceIds,
            bundleType: result.type ?? '',
            resourcesCreated: JSON.stringify(resourcesCreated),
            wasResourceFound: 'false',
          },
        })
      }else {
        const result = await medplumSdk.createResource(resourceData)

        await onComplete({
          data_points: {
            resourceId: result.id ?? '',
            resourceType: result.resourceType,
            wasResourceFound: 'false',
          },
        })
      }
    } catch (error) {
      const err = error as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to create resource: ${err.message}` },
            error: {
              category: 'SERVER_ERROR',
              message: err.message,
            },
          },
        ],
      })
    }
  },
}
