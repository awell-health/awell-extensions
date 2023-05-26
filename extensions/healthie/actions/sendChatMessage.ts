import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  FieldType,
  type Action,
  type Field,
  Category,
} from '@awell-health/awell-extensions-types'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'
import { type Conversation, type SendChatMessage } from '../types'

const fields = {
  healthie_patient_id: {
    id: 'healthie_patient_id',
    label: 'Healthie Patient ID',
    description:
      'The ID of the patient in Healthie you would like to send a chat message to.',
    type: FieldType.STRING,
    required: true,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description:
      'The ID of the provider, the chat message will be sent in name of this provider.',
    type: FieldType.STRING,
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    description: 'The chat message you would like to send.',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  conversationId: {
    key: 'conversationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const sendChatMessage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendChatMessage',
  category: Category.EHR_INTEGRATIONS,
  title: 'Send chat message',
  description: 'Send a chat message to a patient in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { healthie_patient_id, provider_id, message } = fields
    try {
      if (healthie_patient_id === undefined) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`healthie_patient_id` is missing',
              },
            },
          ],
        })
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)

        const createConversation = async (): Promise<Conversation> => {
          const { data } = await sdk.createConversation({
            owner_id: provider_id,
            simple_added_users: `user-${healthie_patient_id}`,
          })

          return data.createConversation?.conversation
        }

        const sendMessage = async (
          conversationId: string
        ): Promise<SendChatMessage> => {
          return await sdk.sendChatMessage({
            input: {
              conversation_id: conversationId,
              content: message,
              /**
               * Send the message in name of the specified provider.
               * If empty or blank, it defaults to the authenticated user.
               */
              user_id: provider_id,
            },
          })
        }

        const getConversation = async (): Promise<Conversation> => {
          const { data } = await sdk.getConversationList({
            client_id: healthie_patient_id,
            active_status: 'active',
            conversation_type: 'individual',
          })

          const conversations = data.conversationMemberships ?? []
          const conversation = conversations.find(
            (value) => value?.convo?.owner?.id === provider_id
          )?.convo

          if (!isNil(conversation)) {
            return conversation
          }

          return await createConversation()
        }

        const conversation = await getConversation()
        const conversationId = conversation?.id

        if (isNil(conversationId)) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: "Conversation doesn't exist nor couldn't be created!",
                },
                error: {
                  category: 'SERVER_ERROR',
                  message:
                    "Conversation doesn't exist nor couldn't be created!",
                },
              },
            ],
          })
          return
        }

        await sendMessage(conversationId)

        await onComplete({
          data_points: {
            conversationId,
          },
        })
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
