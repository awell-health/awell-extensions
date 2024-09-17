import {
  type NewActivityPayload,
  validate,
  type Pathway,
  type Patient,
} from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import { OpenAI } from '@langchain/openai'
import { type Activity } from '@awell-health/extensions-core/dist/types/Activity'

type ValidatePayloadAndCreateSdk = <
  T extends z.ZodTypeAny,
  P extends NewActivityPayload<any, any>
>(args: {
  fieldsSchema: T
  payload: P
}) => Promise<{
  langChainOpenAiSdk: OpenAI
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

  const langChainOpenAiSdk = new OpenAI({
    modelName: 'gpt-4o',
    openAIApiKey: settings.openAiApiKey,
    temperature: 0, // To ensure consistency
  })

  return { langChainOpenAiSdk, fields, settings, patient, pathway, activity }
}
