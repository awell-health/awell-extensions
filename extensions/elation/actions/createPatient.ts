/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  StringType,
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
import { isEmpty, isNil } from 'lodash'

const fields = {
  firstName: {
    id: 'firstName',
    label: 'First name',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  lastName: {
    id: 'lastName',
    label: 'Last name',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  dob: {
    id: 'dob',
    label: 'Date of Birth',
    description: '',
    type: FieldType.DATE,
    required: true,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description: "Possible values are 'Male', 'Female', 'Other', 'Unknown'",
    type: FieldType.STRING,
    required: true,
  },
  primaryPhysicianId: {
    id: 'primaryPhysicianId',
    label: 'Primary Physician ID',
    description: 'The ID of the primary physician associated to the patient',
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
  email: {
    id: 'email',
    label: 'Email',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  mobilePhone: {
    id: 'mobilePhone',
    label: 'Mobile phone',
    description: 'The number will be stored in US national format in Elation',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
  },
  middleName: {
    id: 'middleName',
    label: 'Middle Name',
    description: '',
    type: FieldType.STRING,
  },
  actualName: {
    id: 'actualName',
    label: 'Actual Name',
    description: '',
    type: FieldType.STRING,
  },
  genderIdentity: {
    id: 'genderIdentity',
    label: 'Gender identity',
    description:
      "Possible values are 'unknown', 'man', 'woman', 'transgender_man', 'transgender_woman', 'nonbinary', 'option_not_listed', 'prefer_not_to_say', 'two_spirit'",
    type: FieldType.STRING,
  },
  legalGenderMarker: {
    id: 'legalGenderMarker',
    label: 'Legal gender marker',
    description: "Possible values are 'M', 'F', 'X', 'U'",
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
    description: 'The Social Security number of the patient',
    type: FieldType.STRING,
  },
  ethnicity: {
    id: 'ethnicity',
    label: 'Ethnicity',
    description:
      "Possible values are 'No ethnicity specified', 'Hispanic or Latino', 'Not Hispanic or Latino', 'Declined to specify'.",
    type: FieldType.STRING,
  },
  race: {
    id: 'race',
    label: 'Race',
    description:
      "Possible values are 'No race specified', 'American Indian or Alaska Native', 'Asian', 'Black or African American', 'Native Hawaiian or Other Pacific Islander', 'White', 'Declined to specify'.",
    type: FieldType.STRING,
  },
  preferredLanguage: {
    id: 'preferredLanguage',
    label: 'Preferred language',
    description: "Full names e.g. 'English', 'Spanish' or 'French'.",
    type: FieldType.STRING,
  },
  notes: {
    id: 'notes',
    label: 'Notes',
    description: 'Additional notes about the patient',
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
  tags: {
    id: 'tags',
    label: 'Tags',
    description:
      'The tags associated with the patient. Separate multiple tags with a comma (max 10 per patient).',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
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
      } = payload.fields

      const patientEmail =
        isNil(email) || isEmpty(email) ? undefined : [{ email }]
      const patientMobilePhone =
        isNil(mobilePhone) || isEmpty(mobilePhone)
          ? undefined
          : [{ phone: mobilePhone, phone_type: 'Mobile' }]
      const patientTags =
        isNil(tags) || isEmpty(tags)
          ? undefined
          : tags.split(',').map((tag) => tag.trim())

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
        tags: patientTags,
      })

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const { id } = await api.createPatient(patient)
      await onComplete({
        data_points: {
          patientId: String(id),
        },
      })
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
