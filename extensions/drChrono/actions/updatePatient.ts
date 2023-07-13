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
  gender: {
    id: 'gender',
    label: 'Gender',
    description:
      "Gender of a patient. Possible values are 'male', 'female', 'other'",
    type: FieldType.STRING,
    required: false,
  },
  doctorId: {
    id: 'doctorId',
    label: 'Doctor ID',
    description: '',
    type: FieldType.NUMERIC,
    required: false,
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
    type: FieldType.NUMERIC,
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
