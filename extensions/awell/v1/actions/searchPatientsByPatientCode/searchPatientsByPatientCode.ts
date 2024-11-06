import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, PatientValidationSchema, dataPoints } from './config'
import { z } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const searchPatientsByPatientCode: Action<
  typeof fields,
  typeof settings
> = {
  key: 'searchPatientsByPatientCode',
  category: Category.WORKFLOW,
  title: 'Search patient by patient code (DEPRECATED, USE IDENTIFIERS)',
  description:
    "Search whether the current patient already exists. Search happens based on the `patient_code` field which is taken from the patient's profile.",
  fields,
  dataPoints,
  previewable: false, // We don't have patients in Preview, only cases.
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const {
      patient: {
        id: patientId,
        profile: { patient_code },
      },
    } = validate({
      schema: z.object({
        patient: PatientValidationSchema,
      }),
      payload,
    })
    const awellSdk = await helpers.awellSdk()
    const sdk = new AwellSdk({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      apiUrl: awellSdk.apiUrl!,
      apiKey: awellSdk.apiKey,
    })

    const results = await sdk.searchPatientsByPatientCode({
      patient_code,
    })

    /**
     * When searching for other patients with the same patient code,
     * we need to exclude the current patient from the search results.
     * Otherwise the result would always be true.
     */
    const resultsWithoutCurrentPatient = results.filter(
      (res) => res.id !== patientId
    )

    const numberOfPatientsFound = resultsWithoutCurrentPatient.length
    const patientAlreadyExists = numberOfPatientsFound > 0
    const awellPatientIds = resultsWithoutCurrentPatient
      .map((result) => result.id)
      .join(',')

    await onComplete({
      data_points: {
        patientAlreadyExists: String(patientAlreadyExists),
        numberOfPatientsFound: String(numberOfPatientsFound),
        awellPatientIds,
      },
      events: [
        addActivityEventLog({
          message: patientAlreadyExists
            ? `Patient with patient code ${patient_code} already exists. Patient IDs: ${awellPatientIds}`
            : `Patient with patient code ${patient_code} does not exists yet.`,
        }),
      ],
    })
  },
}
