import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { ChatOpenAI } from '@langchain/openai'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  ChatModelGPT4oMini: ChatOpenAI
  ChatModelGPT4o: ChatOpenAI
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof SettingsValidationSchema>
  pathway: Pathway
  patient: Patient
  activity: Activity
}>

export const validatePayloadAndCreateSdk: ValidatePayloadAndCreateSdk = async ({
  fieldsSchema,
  payload,
}) => {
  const { settings, fields } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: SettingsValidationSchema,
      pathway: z.object({ id: z.string() }),
      activity: z.object({ id: z.string() }),
      patient: z.object({ id: z.string() }),
    }),
    payload,
  })

  const { patient, pathway, activity } = payload

  const ChatModelGPT4oMini = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    openAIApiKey: settings.openAiApiKey,
    temperature: 0, // To ensure consistency
    maxRetries: 3,
    timeout: 10000,
  })

  const ChatModelGPT4o = new ChatOpenAI({
    modelName: 'gpt-4o',
    openAIApiKey: settings.openAiApiKey,
    temperature: 0, // To ensure consistency
    maxRetries: 3,
    timeout: 10000,
  })


  return { ChatModelGPT4o, ChatModelGPT4oMini, fields, settings, patient, pathway, activity }
}
