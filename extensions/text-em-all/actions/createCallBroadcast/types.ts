import { z } from 'zod'

export const BroadcastTypes = z.enum(['Announcement', 'Survey'])

export const VoiceOptions = z.enum([
  'Ivy',
  'Joanna',
  'Kendra',
  'Kimberly',
  'Salli',
  'Joey',
  'Justin',
  'Kevin',
  'Matthew',
])

export type VoiceOption = z.infer<typeof VoiceOptions>

export const VoiceSchema = z.object({
  TextToSpeech: z.boolean(),
  Text: z.string(),
  Voice: VoiceOptions,
})

export const TransferSchema = z.object({
  transferNumber: z.string(),
  transferMessage: z.string(),
  transferDigit: z.string(),
  transferIntroduction: z.string(),
})

export type TransferDetails = z.infer<typeof TransferSchema>

export const AudioType = z.enum([
  'NeverUsed',
  'Announcement',
  'SurveyLiveAnswer',
  'SurveyVoiceMail',
  'AnnouncementVoiceMail',
  'TransferAndConnect',
])

export const AudioSchema = z.object({
  Uri: z.string(),
  AudioID: z.string(),
  Name: z.string(),
  Description: z.string(),
  Favorite: z.boolean(),
  Shared: z.boolean(),
  Length: z.number(),
  MessageType: AudioType,
  ReadOnly: z.boolean(),
  Created: z.string(),
  LastUsed: z.string(),
  TextToSpeech: z.boolean(),
  Text: z.string(),
  Voice: VoiceSchema,
})

export type AudioDetails = z.infer<typeof AudioSchema>
