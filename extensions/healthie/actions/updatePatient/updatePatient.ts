import { isNil, isEmpty } from 'lodash'
import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { initialiseClient } from '../../lib/sdk/graphql-codegen/graphqlClient'
import { type settings } from '../../settings'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
import { fields } from './config'

export const updatePatient: Action<typeof fields, typeof settings> = {
  key: 'updatePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update a patient',
  description: 'Update a patient in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const {
      id,
      first_name,
      last_name,
      legal_name,
      email,
      phone_number,
      provider_id,
      gender,
      gender_identity,
      height,
      sex,
      user_group_id,
      active,
      dob,
    } = fields
    try {
      if (isNil(id)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`id` is missing',
              },
            },
          ],
        })
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        await sdk.updatePatient({
          input: {
            id,
            first_name,
            last_name,
            legal_name,
            email,
            phone_number,
            dietitian_id: provider_id === '' ? undefined : provider_id,
            gender,
            gender_identity,
            height,
            sex,
            user_group_id,
            active,
            dob,
            skipped_email: isEmpty(email),
          },
        })

        await onComplete()
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'API client requires an API url and API key' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing api url or api key',
              },
            },
          ],
        })
      }
    } catch (err) {
      if (err instanceof HealthieError) {
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
