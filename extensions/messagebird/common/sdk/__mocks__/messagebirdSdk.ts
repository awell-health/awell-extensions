import {
  type SendResponse,
  type ConversationParameter,
  type MessageParameters,
  type Message,
} from 'messagebird/types'
import {
  type VoiceMessage,
  type VoiceParametersWithRecipients,
} from 'messagebird/types/voice_messages'

type CallbackFn<T = unknown> = (err: Error | null, res: T | null) => void

const mockSdk = {
  messages: {
    create: jest.fn(
      (params: MessageParameters, callback: CallbackFn<Message>) => {
        console.log('Mocking MessageBird SDK call to messages.create', params)

        callback(null, null)
      }
    ),
  },
  voice_messages: {
    create: jest.fn(
      (
        params: VoiceParametersWithRecipients,
        callback: CallbackFn<VoiceMessage>
      ) => {
        console.log(
          'Mocking MessageBird SDK call to voice_messages.create',
          params
        )

        callback(null, null)
      }
    ),
  },
  conversations: {
    send: jest.fn(
      (params: ConversationParameter, callback: CallbackFn<SendResponse>) => {
        console.log(
          'Mocking MessageBird SDK call to conversations.send',
          params
        )

        callback(null, null)
      }
    ),
  },
}

const mockConstructor = jest.fn((params) => {
  console.log('Calling mock MessageBird constructor', params)

  return mockSdk
})

export default mockConstructor
