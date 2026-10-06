import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { summarizeBatchResult, validateAndCreateSdkClient } from '../../utils'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const executeStoredBundle: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'executeStoredBundle',
  category: Category.EHR_INTEGRATIONS,
  title: 'Execute stored bundle',
  description:
    'Executes a FHIR Bundle (transaction or batch) in Medplum, reading it from a reference instead of from a field. Use it in place of "Find or create resource" when the bundle is too large to pass between care flow steps, such as one stored by the Metriport "Store Webhook Bundle" action.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const stored = await helpers.objectStore.get(input.bundleRef)

      // The bundle is PHI: an error that quotes a malformed one would put it in
      // an activity event, so say that it is not JSON and nothing more.
      let bundle
      try {
        bundle = JSON.parse(stored)
      } catch {
        throw new Error(`The object at ${input.bundleRef} is not valid JSON`)
      }
      if (bundle?.resourceType !== 'Bundle') {
        throw new Error(`The object at ${input.bundleRef} is not a FHIR Bundle`)
      }
      // Medplum rejects any other type, but only after being sent it: and the
      // raw Metriport `bundleRef` is a collection, an easy one to wire in by mistake.
      if (bundle.type !== 'transaction' && bundle.type !== 'batch') {
        throw new Error(
          `The object at ${input.bundleRef} is not a transaction or batch Bundle`,
        )
      }

      // The bundle can be megabytes of PHI: log what it is, not what is in it.
      helpers.log(
        {
          bundleRef: input.bundleRef,
          bundleType: bundle.type,
          entries: bundle.entry?.length ?? 0,
        },
        '[executeStoredBundle] Executing Medplum bundle',
      )

      const result = await medplumSdk.executeBatch(bundle)

      await onComplete({ data_points: summarizeBatchResult(result) })
    } catch (error) {
      const message = `Failed to execute bundle: ${(error as Error).message}`
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: message },
            error: { category: 'SERVER_ERROR', message },
          },
        ],
      })
    }
  },
}
