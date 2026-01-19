import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { type Patient } from '@medplum/fhirtypes'
import { AxiosError } from 'axios'
import { isEmpty } from 'lodash'
import { addActivityEventLog } from '../../../../src/lib/awell'
import { getResourceId } from '../../lib/api/getResourceId'

export const createPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create patient',
  description: 'Create a patient in Cerner',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      cernerFhirR4Sdk,
      fields: {
        familyName,
        givenName,
        email,
        gender,
        birthDate,
        ssn,
        assigningOrganizationId,
      },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const PatientResource = {
      resourceType: 'Patient',
      identifier: [
        // Assigning Organization ID (required)
        {
          assigner: {
            reference: `Organization/${assigningOrganizationId}`,
          },
        },
        // Social Security Number
        ...(!isEmpty(ssn)
          ? [
              {
                type: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'SS',
                    },
                  ],
                },
                system: 'http://hl7.org/fhir/sid/us-ssn',
                value: ssn,
              },
            ]
          : []),
      ],
      name: [
        {
          use: 'official',
          family: familyName,
          given: [givenName],
        },
      ],
      ...(!isEmpty(gender) && {
        gender,
      }),
      ...(!isEmpty(birthDate) && {
        birthDate: birthDate.toISOString().split('T')[0],
      }),
      ...(!isEmpty(email) && {
        telecom: [
          {
            use: 'home',
            system: 'email',
            value: email,
          },
        ],
      }),
    } satisfies Patient

    try {
      const res = await cernerFhirR4Sdk.createPatient(PatientResource)
      const resourceReference =
        (res.headers.Location as string) ?? (res.headers.location as string)
      const resourceId = getResourceId(resourceReference)

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
