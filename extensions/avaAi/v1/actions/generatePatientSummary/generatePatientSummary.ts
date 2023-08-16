import { type Action } from '@awell-health/extensions-core'
import { fields, validateActionFields, dataPoints } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import OpenAiSdk from '../../../common/sdk/openAiSdk'
import { Configuration } from 'openai'
import { generatePrompt } from './utils'

export const generatePatientSummary: Action<typeof fields, typeof settings> = {
  key: 'generatePatientSummary',
  title: 'Generate patient summary',
  description:
    "Generates a human-readable and brief summary about the patient based on the characteristics in the patient's profile.",
  category: Category.AI,
  fields,
  dataPoints,
  previewable: false, // We don't have the concept of a patient (yet) in Preview.
  onActivityCreated: async (payload, onComplete, onError) => {
    const { patient } = payload
    const { openAiApiKey } = validateSettings(payload.settings)
    const { characteristics, language } = validateActionFields(payload.fields)

    const configuration = new Configuration({
      apiKey: openAiApiKey,
    })

    const openai = new OpenAiSdk(configuration)

    const prompt = generatePrompt(patient, characteristics, language)

    const TOKENS_FOR_PROMPT = 400
    const TOKENS_FOR_COMPLETION = 100

    const result = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0, // Output is mostly deterministic, but a small amount of variability may remain
      max_tokens: TOKENS_FOR_PROMPT + TOKENS_FOR_COMPLETION,
      n: 1, // Only generate one completion per prompt
    })

    await onComplete({
      data_points: {
        prompt,
        patientSummary: String(result?.data?.choices[0]?.text),
      },
    })
  },
}
