import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { systemPrompt } from './prompt'
import { parser, type AppointmentsFromAI } from './parser'
import { type AppointmentResponse } from '../../../../types'

interface FindAppointmentsByPromptWithLLMProps {
  model: ChatOpenAI
  appointments: AppointmentResponse[]
  prompt: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}

export const findAppointmentsByPromptWithLLM = async ({
  model,
  appointments,
  prompt,
  metadata,
  callbacks,
}: FindAppointmentsByPromptWithLLMProps): Promise<AppointmentsFromAI> => {
  const chain = model.pipe(parser)

  try {
    const formattedAppointments = appointments
      .map((appointment) => ({
        id: appointment.id,
        reason: appointment.reason,
        scheduled_date: appointment.scheduled_date,
      }))
      .map((appointment) => JSON.stringify(appointment))
      .join('\n\n')
    
    const result = await chain.invoke(
      await systemPrompt.format({
        currentDate: new Date().toISOString().split('T')[0],
        appointments: formattedAppointments,
        prompt,
      }),
      { 
        metadata, 
        runName: 'ElationFindAppointmentsByPrompt',
        callbacks
      }
    )

    return {
      appointmentIds: result.appointmentIds,
      explanation: result.explanation
    }
  } catch (error) {
    throw new Error('Failed to find matching appointments.')
  }
}