/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Fields,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { fromZodError } from 'zod-validation-error'
import { patientWithIdSchema } from '../validation/dto/patient.zod'
import type schemas from '../schemas'

const fields = {
  patient_data: {
    id: 'patient_data',
    label: 'Patient data',
    description: 'Patient data',
    type: FieldType.JSON,
    jsonType: 'canvas_patient',
    required: true,
  },
} satisfies Fields<typeof schemas>

const dataPoints = {
  first_name: {
    key: 'first_name',
    valueType: 'string',
  },
  last_name: {
    key: 'last_name',
    valueType: 'string',
  },
  phone: {
    key: 'phone',
    valueType: 'string',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  dob: {
    key: 'dob',
    valueType: 'string',
  },
  patient_id: {
    key: 'id',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const extractPatientInfo: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints,
  typeof schemas
> = {
  key: 'extractPatientInfo',
  category: Category.EHR_INTEGRATIONS,
  title: 'Extract Patient Info',
  description: 'Extracts common fields from a patient object',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      console.log('fields')
      console.dir(payload.fields, { depth: null })
      const patientData = JSON.parse(payload.fields.patient_data as string)
      const patient = patientWithIdSchema.parse(JSON.parse(patientData))

      const { firstName, lastName } = patient.name.reduce(
        (acc, name) => {
          if (name.use === 'official') {
            acc.firstName = name.given.join(' ').trim()
            acc.lastName = name.family
          }
          return acc
        },
        { firstName: '', lastName: '' }
      )
      const phone =
        patient.telecom.find((t) => t.system === 'phone' && t.use === 'mobile')
          ?.value ?? patient.telecom.find((t) => t.system === 'phone')?.value
      const email = patient.telecom.find((t) => t.system === 'email')?.value
      const dob = patient.birthDate

      await onComplete({
        data_points: {
          patient_id: patient.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          dob,
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
                category: 'SERVER_ERROR',
                message: error.message,
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
