import { isNil } from 'lodash'
import { load as cheerioLoad } from 'cheerio'
import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../../gql/sdk'
import { initialiseClient } from '../../graphqlClient'
import { type settings } from '../../settings'
import { type Conversation, type SendChatMessage } from '../../types'
import { HealthieError, mapHealthieToActivityError } from '../../errors'
import { dataPoints, fields } from './config'

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

        /**
         * We remove the <span> tags from any html because Healthie doesn't
         * support parsing URLs that include Awell dynamic variables (which include
         * <span> tags). This is a temporary workaround until Healthie implements
         * a more complete fix.
         */
        let maybeParsedMessage: string | undefined
        const isValidHTML = /^<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/i.test(
          message ?? ''
        )
        if (isValidHTML) {
          // Parse the HTML content using cheerio
          const $ = cheerioLoad(message ?? '', undefined, false)
          // Remove all <span> tags
          $('span').replaceWith(function () {
            return $(this).contents()
          })
          // Get the modified HTML content
          maybeParsedMessage = $.html()
        } else {
          maybeParsedMessage = message
        }

        const sendMessage = async (
          conversationId: string
        ): Promise<SendChatMessage> => {
          return await sdk.sendChatMessage({
            input: {
              conversation_id: conversationId,
              content: maybeParsedMessage,
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
