import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get patient',
  description: 'Retrieve patient details from Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      epicFhirR4Sdk,
      fields: { resourceId },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const res = await epicFhirR4Sdk.getPatient(resourceId)

      const humanName = res.data.name?.find((name) => name.use === 'official')
      const officialGivenName = humanName?.given?.[0]
      const officialFamilyName = humanName?.family
      const birthDate = res.data.birthDate

      await onComplete({
        data_points: {
          patient: JSON.stringify(res.data),
          officialGivenName,
          officialFamilyName,
          birthDate,
        },
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.status === 404)
          await onError({
            events: [
              addActivityEventLog({
                message: 'Patient not found',
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
