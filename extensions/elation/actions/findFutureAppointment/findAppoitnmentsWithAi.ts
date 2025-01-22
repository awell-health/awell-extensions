import { ChatOpenAI } from '@langchain/openai'
import { type OpenAIConfig } from '@awell-health/extensions-core'

import { createAppointmentPrompt } from './createPrompt'
import { formatAppointments } from './formatAppoitnments'
import {
  AppointmentIdSchema,
  type AppointmentResultType,
  parser,
} from './config/types'
import { type AppointmentResponse } from 'extensions/elation/types'

interface props {
  apiKey: string
  openAiConfig: OpenAIConfig
  appointments: AppointmentResponse[]
  prompt: string
}

export const findMatchingAppointment = async (
  props: props,
): Promise<AppointmentResultType> => {
  const { apiKey, openAiConfig, appointments, prompt } = props

  const ChatModelGPT4o = new ChatOpenAI({
    modelName: 'gpt-4o-2024-08-06',
    openAIApiKey: apiKey,
    temperature: openAiConfig.temperature,
    maxRetries: openAiConfig.maxRetries,
    timeout: openAiConfig.timeout,
  })

  const promptAppointments = formatAppointments(appointments)

  const systemPrompt = createAppointmentPrompt(promptAppointments, prompt)

  let result: AppointmentResultType

  try {
    const chain = ChatModelGPT4o.pipe(parser)
    result = await chain.invoke(systemPrompt)
  } catch (invokeError) {
    console.error(
      'Error invoking ChatModelGPT4o for findFutureAppointment:',
      invokeError,
    )
    throw new Error('Failed to find future appointment.')
  }

  const matchedAppointmentId = AppointmentIdSchema.parse(result.appointmentId)

  return {
    appointmentId: matchedAppointmentId,
    explanation: result.explanation,
  }
}
