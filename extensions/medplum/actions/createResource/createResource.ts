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
  title: 'Create resource',
  description:
    'Create any FHIR resource in Medplum. Supports single resources or FHIR Bundles (transaction/batch) for creating multiple resources atomically.',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: input,
      medplumSdk,
    } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const resourceData = JSON.parse(input.resourceJson)

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

        await onComplete({
          data_points: {
            bundleId: result.id ?? '',
            resourceIds,
            bundleType: result.type ?? '',
          },
        })
      } else {
        const result = await medplumSdk.createResource(resourceData)

        await onComplete({
          data_points: {
            resourceId: result.id ?? '',
            resourceType: result.resourceType,
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
