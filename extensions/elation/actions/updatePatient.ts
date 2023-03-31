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
import { patientSchema, } from '../validation/patient.zod'
import { settingsSchema } from '../validation/settings.zod'
import { numberId } from '../validation/generic.zod'

const fields = {
  patient_id: {
    id: 'patient_id',
    label: 'Patient ID',
    description: 'The patient ID (a number)',
    type: FieldType.STRING,
    required: true,
  },
  first_name: {
    id: 'first_name',
    label: 'First Name',
    description: 'First name',
    type: FieldType.STRING,
    required: true,
  },
  last_name: {
    id: 'last_name',
    label: 'Last Name',
    description: 'Last name',
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
  dob: {
    id: 'dob',
    label: 'Date of Birth',
    description: 'Date of Birth',
    type: FieldType.STRING,
    required: true,
  },
  primary_physician: {
    id: 'primary_physician',
    label: 'Primary Physician',
    description: 'Primary Physician',
    type: FieldType.STRING,
    required: true,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description: 'Sex',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {} satisfies Record<string, DataPointDefinition>

export const updatePatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updatePatient',
  category: Category.DEMO,
  title: 'Update Patient',
  description: "Update patient profile using elation's patient api.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patient_id, ...patientFields } = payload.fields

      const { base_url, ...settings } = settingsSchema.parse(payload.settings);
      const patient = patientSchema.parse(patientFields)
      const patientId = numberId.parse(patient_id)

      // API Call should produce AuthError or something dif.
      const api = new ElationAPIClient({
        auth: {
          ...settings,
        },
        baseUrl: base_url,
        makeDataWrapper,
      })
      await api.updatePatient(patientId, patient)
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
                category: 'BAD_REQUEST',
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
                category: 'BAD_REQUEST',
                message: `${err.status ?? '(no status code)'} Error: ${err.message
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
