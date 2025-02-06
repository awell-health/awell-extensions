import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'

export const getEncounter: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getEncounter',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get encounter',
  description: 'Retrieve encounter details from Cerner',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      cernerFhirR4Sdk,
      fields: { resourceId },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const res = await cernerFhirR4Sdk.getEncounter(resourceId)

      await onComplete({
        data_points: {
          encounter: JSON.stringify(res.data),
        },
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.status === 404)
          await onError({
            events: [
              addActivityEventLog({
                message: 'Encounter not found',
              }),
            ],
          })
        return
      }

      // Throw all other errors
      throw error
    }
  },
}
