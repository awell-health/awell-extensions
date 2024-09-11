import { isNil } from 'lodash'
import { load as cheerioLoad } from 'cheerio'
import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { initialiseClient } from '../../lib/sdk/graphql-codegen/graphqlClient'
import { type settings } from '../../settings'
import { type Conversation, type SendChatMessage } from '../../lib/types'
import {
  HealthieError,
  mapHealthieToActivityError,
} from '../../lib/sdk/graphql-codegen/errors'
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
      if (provider_id === undefined) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`provider_id` is missing',
              },
            },
          ],
        })
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)

        // The logic is as follows:
        // 1. Get all conversations for the patient (by patient id)
        // 2. Find the conversation that has the specified provider / current user as a member
        // 3. If no conversation exists, create a new one including the patient and owned by the specified provider / current user
        // 4. Send the (cleaned up) message to the conversation

        // Questions:
        // 1. What if the patient has multiple conversations with the same provider? -> We find the first conversation
        // that matches the required conversation participants, so this is not deterministic
        // 2. What is the dietitian id? -> This is provider_id, they are the same; dietitian_id is the old name

        const createConversation = async (): Promise<Conversation> => {
          const { data } = await sdk.createConversation({
            /**
             * Send the message in name of the specified provider.
             * If empty or blank, it defaults to the current user.
             * https://docs.gethealthie.com/docs/#createconversation-mutation
             */
            simple_added_users: `user-${healthie_patient_id}`,
            owner_id: provider_id,
            // These are deprecated fields to account for how Healthie conversation lookup logic works for when
            // a patient is (re)assigned a provider and Healthie automatically creates a new conversation between them
            // @ts-expect-error these deprecated fields are not in the schema but are still supported
            dietitian_id: provider_id,
            patient_id: healthie_patient_id,
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

        /**
         * First checks if the conversation exists, if not, creates it.
         * To check for existing conversation, it looks for an active, individual conversation
         * that the patient and provider are both members of. If provider_id is not specified,
         * it defaults to the current user.
         * @returns The conversation object
         */
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
