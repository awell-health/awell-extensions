import { ChatOpenAI } from '@langchain/openai'
import { type OpenAIConfig } from '@awell-health/extensions-core'
import { type AppointmentResponse } from 'extensions/elation/types'
import { createAppointmentPrompt } from './createPrompt'
import { type AppointmentResultType, parser } from './config/types'

interface props {
  apiKey: string
  openAiConfig: OpenAIConfig
  appointments: AppointmentResponse[]
  prompt: string
}

export const findMatchingAppointments = async (
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

  const promptAppointments = appointments
    .map((appointment) => {
      const relevantInfo = {
        id: appointment.id,
        reason: appointment.reason,
        scheduled_date: appointment.scheduled_date,
      }
      return JSON.stringify(relevantInfo)
    })
    .join('\n\n')

  const systemPrompt = createAppointmentPrompt({
    prompt,
    appointments: promptAppointments,
  })

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

  return {
    appointmentIds: result.appointmentIds,
    explanation: result.explanation,
  }
}
