import { type getSdk } from "./gql/sdk";

type Sdk = ReturnType<typeof getSdk>

export type CreateConversation = Awaited<ReturnType<Sdk['createConversation']>>
export type Conversation = NonNullable<CreateConversation['data']['createConversation']>['conversation']
export type SendChatMessage = Awaited<ReturnType<Sdk['sendChatMessage']>>