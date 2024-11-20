import { isNil } from 'lodash'
import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import {
  fields,
  FieldsValidationSchema,
  type UpdatePatientPayload,
} from './config'
import { ZodError } from 'zod'

export const updatePatient: Action<typeof fields, typeof settings> = {
  key: 'updatePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update a patient',
  description: 'Update a patient in Healthie.',
  fields,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError }) => {
    try {
      const { fields, healthieSdk } = await validatePayloadAndCreateSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })
      const dietitian_id =
        fields.provider_id === '' || isNil(fields.provider_id)
          ? undefined
          : fields.provider_id

      const input: UpdatePatientPayload = {
        id: fields.id,
        first_name: fields.first_name,
        last_name: fields.last_name,
        legal_name: fields.legal_name,
        email: fields.email,
        phone_number: fields.phone_number,
        dietitian_id,
        gender: fields.gender,
        gender_identity: fields.gender_identity,
        height: fields.height,
        sex: fields.sex,
        user_group_id: fields.user_group_id,
        active: fields.active,
        dob: fields.dob,
      }

      if (fields.resend_welcome_email === true) {
        input.resend_welcome = true
      }

      await healthieSdk.client.mutation({
        updateClient: {
          __args: {
            input,
          },
          user: {
            id: true,
          },
          messages: {
            __scalar: true,
          },
        },
      })

      await onComplete()
    } catch (err) {
      if (err instanceof HealthieError) {
        const errors = mapHealthieToActivityError(err.errors)
        await onError({
          events: errors,
        })
      } else if (err instanceof ZodError) {
        throw err
      } else {
        const error = err as Error
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Healthie API reported an error' },
              error: {
                category: 'SERVER_ERROR',
                message: error.message,
              },
            },
          ],
        })
      }
    }
  },
}
