import { type voice } from 'messagebird/types/voice_messages'

export const getVoice = (voiceFieldValue: string | undefined): voice => {
  if (voiceFieldValue === 'male' || voiceFieldValue === 'female') {
    return voiceFieldValue
  }

  const defaultVoice = 'female'

  return defaultVoice
}
