import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { patientSchema } from '../../validation/patient.zod'
import { isEmpty, isNil } from 'lodash'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const createPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Patient',
  description: "Create a patient profile using Elation's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      firstName,
      lastName,
      actualName,
      caregiverPracticeId,
      genderIdentity,
      legalGenderMarker,
      middleName,
      preferredLanguage,
      previousFirstName,
      previousLastName,
      primaryPhysicianId,
      sexualOrientation,
      dob,
      sex,
      email,
      mobilePhone,
      pronouns,
      ssn,
      ethnicity,
      race,
      notes,
      tags,
    } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    const patientEmail =
      isNil(email) || isEmpty(email) ? undefined : [{ email }]

    const patientMobilePhone =
      isNil(mobilePhone) || isEmpty(mobilePhone)
        ? undefined
        : [{ phone: mobilePhone, phone_type: 'Mobile' }]

    const patient = patientSchema.parse({
      first_name: firstName,
      last_name: lastName,
      primary_physician: primaryPhysicianId,
      caregiver_practice: caregiverPracticeId,
      middle_name: middleName,
      actual_name: actualName,
      gender_identity: genderIdentity,
      legal_gender_marker: legalGenderMarker,
      sexual_orientation: sexualOrientation,
      preferred_language: preferredLanguage,
      previous_first_name: previousFirstName,
      previous_last_name: previousLastName,
      emails: patientEmail,
      phones: patientMobilePhone,
      dob,
      sex,
      pronouns,
      ssn,
      ethnicity,
      race,
      notes,
      tags,
    })

    try {
      const { data } = await api.createPatient(patient)

      await onComplete({
        data_points: {
          patientId: String(data.id),
        },
      })
    } catch (err) {
      // Handle the patient exists already specifically. Every other validation or axios error is handled
      // by the default error handler in extensions-core.
      if (err instanceof AxiosError && err.response?.status === 409) {
        await onComplete({
          data_points: {
            patientId: String(err.response?.data?.redirect),
          },
          events: [
            addActivityEventLog({
              message: `Patient already exists. Returning the existing patient id.`,
            }),
          ],
        })
        return
      }

      throw err
    }
  },
}
