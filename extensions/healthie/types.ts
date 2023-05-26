import { type getSdk } from './gql/sdk'

export interface HealthieWebhookPayload {
  resource_id: string
  resource_id_type: string
  event_type: string
}

type Sdk = ReturnType<typeof getSdk>

export type CreateConversation = Awaited<ReturnType<Sdk['createConversation']>>
export type Conversation = NonNullable<
  CreateConversation['data']['createConversation']
>['conversation']
export type SendChatMessage = Awaited<ReturnType<Sdk['sendChatMessage']>>
