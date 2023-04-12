/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'
import { ElationAPIClient, makeDataWrapper } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { patientSchema } from '../validation/patient.zod'
import { settingsSchema } from '../validation/settings.zod'

const fields = {
  first_name: {
    id: 'first_name',
    label: 'First Name',
    description: 'Maximum length of 70 characters',
    type: FieldType.STRING,
    required: true,
  },
  last_name: {
    id: 'last_name',
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
  primary_physician: {
    id: 'primary_physician',
    label: 'Primary Physician',
    description: 'Primary Physician ID',
    type: FieldType.STRING,
    required: true,
  },
  caregiver_practice: {
    id: 'caregiver_practice',
    label: 'Caregiver Practice',
    description: 'Caregiver Practice ID',
    type: FieldType.STRING,
    required: true,
  },
  middle_name: {
    id: 'middle_name',
    label: 'Middle Name',
    description: 'Maximum length of 50 characters',
    type: FieldType.STRING,
  },
  actual_name: {
    id: 'actual_name',
    label: 'Actual Name',
    description: 'Maximum length of 150 characters',
    type: FieldType.STRING,
  },
  gender_identity: {
    id: 'gender_identity',
    label: 'Gender identity',
    description:
      "Gender identity of a patient. Possible values are 'unknown', 'man', 'woman', 'transgender_man', 'transgender_woman', 'nonbinary', 'option_not_listed', 'prefer_not_to_say', 'two_spirit'",
    type: FieldType.STRING,
  },
  legal_gender_marker: {
    id: 'legal_gender_marker',
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
  sexual_orientation: {
    id: 'sexual_orientation',
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
  preferred_language: {
    id: 'preferred_language',
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
  previous_first_name: {
    id: 'previous_first_name',
    label: 'Previous first name',
    description: 'The previous first name of the patient',
    type: FieldType.STRING,
  },
  previous_last_name: {
    id: 'previous_last_name',
    label: 'Previous last name',
    description: 'The previous last name of the patient',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
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
      const { base_url, ...settings } = settingsSchema.parse(payload.settings)
      const patient = patientSchema.parse(payload.fields)

      // API Call should produce AuthError or something dif.
      const api = new ElationAPIClient({
        auth: settings,
        baseUrl: base_url,
        makeDataWrapper,
      })
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
