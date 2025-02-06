import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'

export const getPatientEncounters: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatientEncounters',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get patient encounters',
  description: 'Retrieve all encounters for a patient',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      cernerFhirR4Sdk,
      fields: { patientResourceId },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const { data } = await cernerFhirR4Sdk.searchEncounter({
        patientResourceId,
      })

      if (data?.total === 0) {
        throw new Error('No encounters found')
      }

      await onComplete({
        data_points: {
          encounters: JSON.stringify(data.entry),
        },
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        await onError({
          events: [
            addActivityEventLog({
              message: `Status: ${String(err.response?.status)} (${String(
                err.response?.statusText,
              )})\n${JSON.stringify(err.response?.data, null, 2)}`,
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
