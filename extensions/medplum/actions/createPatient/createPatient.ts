import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import {
  AWELL_IDENTIFIER_SYSTEM,
  validateAndCreateSdkClient,
} from '../../utils'
import { isEmpty } from 'lodash'
import { type ContactPoint } from '@medplum/fhirtypes'

export const createPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create patient',
  description: 'Create a patient in Medplum',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: input,
      medplumSdk,
      patient,
    } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const mobilePhone: ContactPoint | null = !isEmpty(input.mobilePhone)
      ? {
          system: 'phone',
          value: input.mobilePhone,
          use: 'mobile',
        }
      : null

    const email: ContactPoint | null = !isEmpty(input.email)
      ? {
          system: 'email',
          value: input.email,
          use: 'home',
        }
      : null

    const addressLine = !isEmpty(input.address) ? [input.address ?? ''] : []

    /**
     * We only create the patient in Medplum if that patient
     * doesn't exist yet.
     */
    const res = await medplumSdk.createResourceIfNoneExist(
      {
        resourceType: 'Patient',
        identifier: [
          {
            system: 'https://www.awellhealth.com/',
            value: patient.id,
            assigner: {
              display: 'Awell',
            },
          },
        ],
        name: [
          {
            use: 'official',
            family: input.lastName,
            given: isEmpty(input.firstName) ? [] : [String(input.firstName)],
          },
        ],
        telecom: [
          ...((mobilePhone != null) ? [mobilePhone] : []),
          ...((email != null) ? [email] : []),
        ],
        birthDate: input.birthDate,
        gender: input.gender,
        address: [
          {
            use: 'home',
            line: addressLine,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
          },
        ],
      },
      `identifier=${AWELL_IDENTIFIER_SYSTEM}|${patient.id}`
    )

    await onComplete({
      data_points: {
        // @ts-expect-error id is not included in the response type?
        patientId: res.id,
      },
    })
  },
}
