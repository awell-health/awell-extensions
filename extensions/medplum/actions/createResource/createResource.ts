import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { summarizeBatchResult, validateAndCreateSdkClient } from '../../utils'
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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const resourceData = JSON.parse(input.resourceJson)

      if (
        input.searchResourceType != null &&
        input.searchResourceType !== '' &&
        input.searchIdentifier != null &&
        input.searchIdentifier !== ''
      ) {
        const searchParams: Record<string, string> = {
          identifier: input.searchIdentifier,
        }

        const searchBundle = await medplumSdk.search(
          input.searchResourceType as any,
          searchParams,
        )

        if (searchBundle.entry !== undefined && searchBundle.entry.length > 0) {
          const latestResource =
            searchBundle.entry[searchBundle.entry.length - 1].resource

          if (latestResource !== undefined) {
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
        helpers.log(
          { resourceData },
          '[createResource] Executing Medplum bundle',
        )

        const result = await medplumSdk.executeBatch(resourceData as Bundle)
        helpers.log(
          { batchResult: result },
          '[Medplum extension] Medplum batch result'
        )

        await onComplete({
          data_points: {
            ...summarizeBatchResult(result),
            wasResourceFound: 'false',
          },
        })
      } else {
        helpers.log(
          { resourceData },
          '[createResource] Creating Medplum resource',
        )

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
