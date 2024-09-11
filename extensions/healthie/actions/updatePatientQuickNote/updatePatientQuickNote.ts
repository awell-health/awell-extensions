import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { initialiseClient } from '../../lib/sdk/graphql-codegen/graphqlClient'
import { SettingsValidationSchema, type settings } from '../../settings'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { fields, FieldsValidationSchema } from './config'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'

export const updatePatientQuickNote: Action<typeof fields, typeof settings> = {
  key: 'updatePatientQuickNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update patient quick note',
  description: 'Update a patient quick note in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings,
        fields: { patientId, overwrite, quickNote },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = initialiseClient(settings)
      if (client != null) {
        const sdk = getSdk(client)
        if (overwrite) {
          await sdk.updatePatient({
            input: { id: patientId, quick_notes: quickNote },
          })
        } else {
          const { data } = await sdk.getUser({ id: patientId })
          const currentNotes = data?.user?.quick_notes ?? ''
          await sdk.updatePatient({
            input: {
              id: patientId,
              quick_notes: currentNotes.concat(quickNote),
            },
          })
        }

        await onComplete({})
      }
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
      } else if (err instanceof HealthieError) {
        const errors = mapHealthieToActivityError(err.errors)
        await onError({
          events: errors,
        })
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
