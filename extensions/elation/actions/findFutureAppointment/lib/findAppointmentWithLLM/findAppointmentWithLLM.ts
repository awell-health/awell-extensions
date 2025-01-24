import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import { systemPrompt } from './prompt'
import { parser, type AppointmentFromAI } from './parser'
import { type AppointmentResponse } from '../../../../types'
import { formatAppointments } from '../../formatAppointments'

interface FindAppointmentWithLLMProps {
  model: ChatOpenAI
  appointments: AppointmentResponse[]
  prompt: string
  metadata: AIActionMetadata
}

export const findAppointmentWithLLM = async ({
  model,
  appointments,
  prompt,
  metadata,
}: FindAppointmentWithLLMProps): Promise<AppointmentFromAI> => {
  const chain = model.pipe(parser)

  try {
    const result = await chain.invoke(
      await systemPrompt.format({
        format_instructions: parser.getFormatInstructions(),
        appointments: formatAppointments(appointments),
        prompt,
      }),
      { metadata, runName: 'ElationFindAppointment' }
    )

    return {
      appointmentId: result.appointmentId,
      explanation: result.explanation
    }
  } catch (error) {
    console.error('Error in findAppointmentWithLLM:', error, metadata)
    throw new Error('Failed to find matching appointment.')
  }
}