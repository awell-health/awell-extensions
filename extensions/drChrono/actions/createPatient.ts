/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
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
  gender: {
    id: 'gender',
    label: 'Gender',
    description:
      "Gender of a patient. Possible values are 'male', 'female', 'other'",
    type: FieldType.STRING,
    required: true,
  },
  doctorId: {
    id: 'doctorId',
    label: 'Doctor ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  firstName: {
    id: 'firstName',
    label: 'First Name',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  dateOfBirth: {
    id: 'dateOfBirth',
    label: 'Date of Birth',
    description: 'Date of Birth (YYYY-MM-DD)',
    type: FieldType.DATE,
    required: false,
  },
  ethnicity: {
    id: 'ethnicity',
    label: 'Ethnicity',
    description:
      "The ethnicity of the patient. Possible values are 'blank', 'hispanic', 'not_hispanic', 'declined'.",
    type: FieldType.STRING,
    required: false,
  },
  race: {
    id: 'race',
    label: 'Race',
    description:
      "The race of the patient. Possible values are 'blank', 'indian', 'asian', 'black', 'hawaiian', 'white', 'declined'.",
    type: FieldType.STRING,
    required: false,
  },
  preferredLanguage: {
    id: 'preferredLanguage',
    label: 'Preferred Language',
    description:
      "The language preferred by the patient. Possible values are 'blank', 'eng', 'zho', 'fra', 'ita', 'jpn', 'por', 'rus', 'spa', 'other', 'unknown', 'declined'.",
    type: FieldType.STRING,
    required: false,
  },
  chartId: {
    id: 'chartId',
    label: 'Chart ID',
    description: 'Automatically set using first & last name if absent',
    type: FieldType.STRING,
    required: false,
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
        chartId,
        dateOfBirth,
        doctorId,
        firstName,
        lastName,
        preferredLanguage,
        ...fields
      } = payload.fields

      const patient = patientSchema.parse({
        ...fields,
        first_name: firstName,
        last_name: lastName,
        chart_id: chartId,
        doctor: doctorId,
        date_of_birth: dateOfBirth,
        preferred_language: preferredLanguage,
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
