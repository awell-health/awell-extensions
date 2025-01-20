import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { type Patient } from '@medplum/fhirtypes'
import { AxiosError } from 'axios'
import { isEmpty } from 'lodash'
import { addActivityEventLog } from '../../../../src/lib/awell'

export const createPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create patient',
  description: 'Create a patient in Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      epicFhirR4Sdk,
      fields: { familyName, givenName, email, gender, birthDate, ssn },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const PatientResource = {
      resourceType: 'Patient',
      identifier: [
        {
          use: 'usual',
          system: 'urn:oid:2.16.840.1.113883.4.1', // SSN
          value: ssn,
        },
      ],
      name: [
        {
          use: 'official',
          family: familyName,
          given: [givenName],
        },
      ],
      gender,
      birthDate: birthDate.toISOString().split('T')[0],
      ...(!isEmpty(email) && {
        telecom: [
          {
            system: 'email',
            value: email,
          },
        ],
      }),
    } satisfies Patient

    try {
      const res = await epicFhirR4Sdk.createPatient(PatientResource)
      const resourceReference =
        (res.headers.Location as string) ?? (res.headers.location as string)
      const resourceId = resourceReference.split('/')[1]

      await onComplete({
        data_points: {
          resourceId,
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
