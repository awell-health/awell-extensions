import { isNil } from 'lodash'
import { mapHealthieToActivityError } from '../errors'
import { FieldType, type Action, type Field } from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'

const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the conversation in Healthie',
    type: FieldType.STRING,
    required: true,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description: 'This is the ID of the provider.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const closeChatConversation: Action<typeof fields, typeof settings> = {
  key: 'closeChatConversation',
  category: Category.EHR_INTEGRATIONS,
  title: 'Close chat conversation',
  description: 'Close chat conversation in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { id, provider_id } = fields
    try {
      if (isNil(id) || isNil(provider_id)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`id` or `provider_id` is missing',
              },
            },
          ],
        })
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.updateConversation({
          input: {
            id,
            closed_by_id: provider_id,
          },
        })

        if (!isNil(data.updateConversation?.messages)) {
          const errors = mapHealthieToActivityError(
            data.updateConversation?.messages
          )
          await onError({
            events: errors,
          })
          return
        }

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
  },
}
