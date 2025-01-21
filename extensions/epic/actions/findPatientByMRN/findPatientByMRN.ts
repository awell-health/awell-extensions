import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'

export const findPatientByMRN: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findPatientByMRN',
  category: Category.EHR_INTEGRATIONS,
  title: 'Find patient by MRN',
  description: 'Find patient by MRN in Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      epicFhirR4Sdk,
      fields: { MRN },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const { data } = await epicFhirR4Sdk.searchPatient({ MRN })
      const matchCount = data.total ?? 0

      if (matchCount === 0) {
        throw new Error('No patient found')
      }

      if (matchCount > 1) {
        throw new Error('Multiple patients found')
      }

      await onComplete({
        data_points: {
          resourceId: data?.entry?.[0]?.resource?.id,
        },
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const err = error as AxiosError
        await onError({
          events: [
            addActivityEventLog({
              message: JSON.stringify(err.response?.data, null, 2),
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
