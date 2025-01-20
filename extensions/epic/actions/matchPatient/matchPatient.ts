import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { type PatientMatchInputType } from '../../lib/api/FhirR4/schema'
import { isEmpty } from 'lodash'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'

export const matchPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'matchPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Match patient',
  description: 'Match patient to existing patient in Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      epicFhirR4Sdk,
      fields: { familyName, givenName, birthDate, gender, email },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    /**
     * Matching by SSN is not allowed due to security reasons.
     */
    const patientMatchInput = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'resource',
          resource: {
            resourceType: 'Patient',
            name: [
              {
                family: familyName,
                given: [givenName],
              },
            ],
            birthDate: birthDate.toISOString().split('T')[0],
            gender,
            ...(!isEmpty(email) && {
              telecom: [
                {
                  system: 'email',
                  value: email,
                },
              ],
            }),
          },
        },
        {
          name: 'onlyCertainMatches',
          valueBoolean: 'true',
        },
      ],
    } satisfies PatientMatchInputType

    try {
      const { data } = await epicFhirR4Sdk.matchPatient(patientMatchInput)
      const matchCount = data.total

      if (matchCount !== 1) {
        throw new Error('No match found')
      }

      await onComplete({
        data_points: {
          resourceId: data.entry[0].resource.id,
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
