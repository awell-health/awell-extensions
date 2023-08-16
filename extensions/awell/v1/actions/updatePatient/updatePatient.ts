import { type Action } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  FieldsValidationSchema,
  PatientValidationSchema,
} from './config'
import { z } from 'zod'
import AwellSdk from '../../sdk/awellSdk'

export const updatePatient: Action<typeof fields, typeof settings> = {
  key: 'updatePatient',
  category: Category.WORKFLOW,
  title: 'Update patient',
  description: 'Update the current patient with new data.',
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      settings: { apiUrl, apiKey },
      fields: {
        patientCode,
        firstName,
        lastName,
        birthDate,
        email,
        phone,
        mobilePhone,
        street,
        state,
        country,
        city,
        zip,
        preferredLanguage,
        sex,
      },
      patient: { id: patientId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
        patient: PatientValidationSchema,
      }),
      payload,
    })

    const sdk = new AwellSdk({ apiUrl, apiKey })

    await sdk.updatePatient({
      patient_id: patientId,
      profile: {
        patient_code: patientCode,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        email,
        phone,
        mobile_phone: mobilePhone,
        address: {
          street,
          state,
          country,
          city,
          zip,
        },
        preferred_language: preferredLanguage,
        sex,
      },
    })

    await onComplete()
  },
}
