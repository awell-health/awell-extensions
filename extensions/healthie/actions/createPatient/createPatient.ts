import { isEmpty } from 'lodash'
import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import {
  fields,
  FieldsValidationSchema,
  dataPoints,
  type CreatePatientPayload,
} from './config'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'
import {
  HealthiePatientNotCreated,
  parseHealthiePatientNotCreatedError,
} from './lib/errors'

export const createPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create a patient',
  description: 'Create a patient in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const { fields, healthieSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const dont_send_welcome = fields.send_invite !== true
    const dietitian_id =
      fields.provider_id === undefined || fields.provider_id === ''
        ? undefined
        : fields.provider_id
    const skipped_email = fields.email === undefined || fields.email === '' // if email is empty we still want to create the patient

    try {
      const input: CreatePatientPayload = {
        first_name: fields.first_name,
        last_name: fields.last_name,
        legal_name: fields.legal_name,
        email: fields.email,
        phone_number: fields.phone_number,
        dob: fields.dob,
        dietitian_id,
        dont_send_welcome,
      }

      if (skipped_email) {
        input.skipped_email = true
      }
      const res = await healthieSdk.client.mutation({
        createClient: {
          __args: {
            input,
          },
          user: {
            id: true,
            set_password_link: true, // for testing
          },
          messages: {
            __scalar: true,
          },
        },
      })

      if (isEmpty(res?.createClient?.user?.id))
        throw new HealthiePatientNotCreated(res)

      await onComplete({
        data_points: {
          healthiePatientId: res.createClient?.user?.id,
        },
      })
    } catch (error) {
      if (error instanceof HealthiePatientNotCreated) {
        await onError({
          events: [parseHealthiePatientNotCreatedError(error.errors)],
        })
      } else if (error instanceof HealthieError) {
        const errors = mapHealthieToActivityError(error.errors)
        await onError({
          events: errors,
        })
      } else {
        throw error
      }
    }
  },
}
