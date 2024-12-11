import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { elationMobilePhoneToE164 } from '../../utils/elationMobilePhoneToE164'
import { getLastEmail } from '../../utils/getLastEmail'

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Patient',
  description: 'Retrieve a patient profile using Elation`s patient API.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, settings } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })
    // API Call should produce AuthError or something dif.
    const api = makeAPIClient(settings)

    const patientInfo = await api.getPatient(fields.patientId)

    await onComplete({
      data_points: {
        firstName: patientInfo.first_name,
        lastName: patientInfo.last_name,
        dob: patientInfo.dob,
        sex: patientInfo.sex,
        primaryPhysicianId: String(patientInfo.primary_physician),
        caregiverPracticeId: String(patientInfo.caregiver_practice),
        mainPhone: elationMobilePhoneToE164(
          patientInfo.phones?.find((p) => p.phone_type === 'Main')?.phone
        ),
        mobilePhone: elationMobilePhoneToE164(
          patientInfo.phones?.find((p) => p.phone_type === 'Mobile')?.phone
        ),
        email: getLastEmail(patientInfo.emails),
        middleName: patientInfo.middle_name,
        actualName: patientInfo.actual_name,
        genderIdentity: patientInfo.gender_identity,
        legalGenderMarker: patientInfo.legal_gender_marker,
        pronouns: patientInfo.pronouns,
        sexualOrientation: patientInfo.sexual_orientation,
        ssn: patientInfo.ssn,
        ethnicity: patientInfo.ethnicity,
        race: patientInfo.race,
        preferredLanguage: patientInfo.preferred_language,
        notes: patientInfo.notes,
        previousFirstName: patientInfo.previous_first_name,
        previousLastName: patientInfo.previous_last_name,
        status: patientInfo.patient_status.status,
        preferredServiceLocationId: String(
          patientInfo.preferred_service_location
        ),
        patientObject: JSON.stringify(patientInfo),
      },
    })
  },
}
