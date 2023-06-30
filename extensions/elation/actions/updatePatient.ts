/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  NumericIdSchema,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { patientSchema } from '../validation/patient.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient ID (a number)',
    type: FieldType.NUMERIC,
    required: true,
  },
  firstName: {
    id: 'firstName',
    label: 'First Name',
    description: 'Maximum length of 70 characters',
    type: FieldType.STRING,
    required: true,
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    description: 'Maximum length of 70 characters',
    type: FieldType.STRING,
    required: true,
  },
  dob: {
    id: 'dob',
    label: 'Date of Birth',
    description: 'Date of Birth (YYYY-MM-DD)',
    type: FieldType.STRING,
    required: true,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description:
      "Sex of a patient. Possible values are 'Male', 'Female', 'Other', 'Unknown'",
    type: FieldType.STRING,
    required: true,
  },
  primaryPhysicianId: {
    id: 'primaryPhysicianId',
    label: 'Primary Physician ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  caregiverPracticeId: {
    id: 'caregiverPracticeId',
    label: 'Caregiver Practice ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  middleName: {
    id: 'middleName',
    label: 'Middle Name',
    description: 'Maximum length of 50 characters',
    type: FieldType.STRING,
  },
  actualName: {
    id: 'actualName',
    label: 'Actual Name',
    description: 'Maximum length of 150 characters',
    type: FieldType.STRING,
  },
  genderIdentity: {
    id: 'genderIdentity',
    label: 'Gender identity',
    description:
      "Gender identity of a patient. Possible values are 'unknown', 'man', 'woman', 'transgender_man', 'transgender_woman', 'nonbinary', 'option_not_listed', 'prefer_not_to_say', 'two_spirit'",
    type: FieldType.STRING,
  },
  legalGenderMarker: {
    id: 'legalGenderMarker',
    label: 'Legal gender marker',
    description:
      "Legal gender marker of a patient. Possible values are 'M', 'F', 'X', 'U'",
    type: FieldType.STRING,
  },
  pronouns: {
    id: 'pronouns',
    label: 'Pronouns',
    description:
      "Pronouns by which a patient identifies self. Possible values are 'he_him_his', 'she_her_hers', 'they_them_theirs', 'not_listed'",
    type: FieldType.STRING,
  },
  sexualOrientation: {
    id: 'sexualOrientation',
    label: 'Sexual orientation',
    description:
      "Possible values are 'unknown', 'straight', 'gay', 'bisexual', 'option_not_listed', 'prefer_not_to_say', 'lesbian', 'queer', 'asexual'",
    type: FieldType.STRING,
  },
  ssn: {
    id: 'ssn',
    label: 'SSN',
    description: 'Social Security number. A number with 9 digits',
    type: FieldType.STRING,
  },
  ethnicity: {
    id: 'ethnicity',
    label: 'Ethnicity',
    description:
      "The ethnicity of the person. Possible values are 'No ethnicity specified', 'Hispanic or Latino', 'Not Hispanic or Latino', 'Declined to specify'.",
    type: FieldType.STRING,
  },
  race: {
    id: 'race',
    label: 'Race',
    description:
      "The race of the person. Possible values are 'No race specified', 'American Indian or Alaska Native', 'Asian', 'Black or African American', 'Native Hawaiian or Other Pacific Islander', 'White', 'Declined to specify'.",
    type: FieldType.STRING,
  },
  preferredLanguage: {
    id: 'preferredLanguage',
    label: 'Preferred language',
    description:
      "The language preferred by the patient. Full names e.g. 'English', 'Spanish' or 'French'.",
    type: FieldType.STRING,
  },
  notes: {
    id: 'notes',
    label: 'Notes',
    description:
      'Additional notes about the patient. Maximum length of 500 characters.',
    type: FieldType.STRING,
  },
  previousFirstName: {
    id: 'previousFirstName',
    label: 'Previous first name',
    description: 'The previous first name of the patient',
    type: FieldType.STRING,
  },
  previousLastName: {
    id: 'previousLastName',
    label: 'Previous last name',
    description: 'The previous last name of the patient',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {} satisfies Record<string, DataPointDefinition>

export const updatePatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updatePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Patient',
  description: "Update a patient profile using Elation's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        patientId,
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
        ...fields
      } = payload.fields

      const patient = patientSchema.parse({
        ...fields,
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
      })

      const id = NumericIdSchema.parse(patientId)

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      await api.updatePatient(id, patient)
      await onComplete()
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
