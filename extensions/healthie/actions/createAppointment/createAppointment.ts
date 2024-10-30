import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'
import {
  HealthieAppointmentNotCreated,
  parseHealthieAppointmentNotCreatedError,
} from './lib/errors'

export const createAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create 1:1 appointment',
  description: 'Create a 1:1 appointment in Healthie.',
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const { fields, healthieSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const res = await healthieSdk.client.mutation({
        createAppointment: {
          __args: {
            input: {
              appointment_type_id: fields.appointmentTypeId,
              contact_type: fields.contactTypeId,
              other_party_id: fields.otherPartyId,
              datetime: fields.datetime,
              user_id: fields.patientId,
              metadata: JSON.stringify(fields.metadata),
              notes: fields.notes,
              external_videochat_url: fields.externalVideochatUrl,
            },
          },
          appointment: {
            id: true,
          },
        },
      })

      const appointmentId = res.createAppointment?.appointment?.id

      if (appointmentId === undefined)
        throw new HealthieAppointmentNotCreated(res)

      await onComplete({
        data_points: {
          appointmentId,
        },
      })
    } catch (error) {
      if (error instanceof HealthieAppointmentNotCreated) {
        await onError({
          events: [parseHealthieAppointmentNotCreatedError(error.errors)],
        })
      } else if (error instanceof HealthieError) {
        const errors = mapHealthieToActivityError(error.errors)
        await onError({
          events: errors,
        })
      } else {
        // Handles Zod and other unknown errors
        throw error
      }
    }
  },
}
