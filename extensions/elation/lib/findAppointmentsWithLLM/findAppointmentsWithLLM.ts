import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import { systemPromptWithDates, systemPromptWithoutDates } from './prompt'
import { parser, type AppointmentsFromLLM } from './parser'
import { type AppointmentResponse } from '../../types'
interface FindAppointmentsWithLLMProps {
  model: ChatOpenAI
  appointments: AppointmentResponse[]
  prompt: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
  evaluateDates?: boolean
}

export const findAppointmentsWithLLM = async ({
  model,
  appointments,
  prompt,
  metadata,
  callbacks,
  evaluateDates = false,
}: FindAppointmentsWithLLMProps): Promise<AppointmentsFromLLM> => {
  const chain = model.pipe(parser)

  try {
    const formattedAppointments = JSON.stringify(appointments)
    const systemPrompt = evaluateDates
      ? systemPromptWithDates
      : systemPromptWithoutDates

    const result = await chain.invoke(
      await systemPrompt.format({
        currentDateTime: new Date().toISOString(),
        appointments: formattedAppointments,
        prompt,
      }),
      {
        metadata,
        runName: 'ElationFindAppointmentsWithLLM',
        callbacks,
      },
    )

    return {
      appointmentIds: result.appointmentIds,
      explanation: result.explanation,
    }
  } catch (error) {
    throw new Error(
      `Failed to find matching appointments. LLM reported error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}
