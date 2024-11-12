import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
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
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const {
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
        nationalRegistryNumber,
      },
      patient: { id: patientId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        patient: PatientValidationSchema,
      }),
      payload,
    })

    const awellSdk = await helpers.awellSdk()
    const sdk = new AwellSdk({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      apiUrl: awellSdk.apiUrl!,
      apiKey: awellSdk.apiKey,
    })

    // we cannot use this until we fully deprecate patient_code
    // await awellSdk.orchestration.mutation({
    //   updatePatient: {
    //     __args: {
    //       input: {
    //         patient_id: patientId,
    //         patient_code: patientCode,
    //         first_name: firstName,
    //         last_name: lastName,
    //         birth_date: birthDate,
    //         email,
    //         phone,
    //         mobile_phone: mobilePhone,
    //         address: {
    //           street,
    //           state,
    //           country,
    //           city,
    //           zip,
    //         },
    //         preferred_language: preferredLanguage,
    //         sex,
    //         national_registry_number: nationalRegistryNumber,
    //       },
    //     },
    //   }
    // })

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
        national_registry_number: nationalRegistryNumber,
      },
    })

    await onComplete()
  },
}
