import 'dotenv/config'
import { generateMessageWithLLM } from './generateMessageWithLLM'
import { type ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk } from '@langchain/core/messages'


describe('generateMessageWithLLM', () => {
  let ChatModelGPT4oMock: jest.Mocked<ChatOpenAI>

  beforeEach(() => {
    ChatModelGPT4oMock = {
      pipe: jest.fn().mockReturnThis(),
      invoke: jest.fn(),
    } as unknown as jest.Mocked<ChatOpenAI>
  })

  it('should generate a message for a patient appointment reminder', async () => {
    const mockedResponse = {
      subject: 'Your Upcoming Appointment Reminder',
      message: 'Dear John,\n\nThis is a reminder about your appointment scheduled for tomorrow at 2:00 PM. Please arrive 15 minutes early to complete any necessary paperwork.\n\nBest regards,\nYour Care Team'
    }

    // Mock returning the AIMessageChunk with JSON stringified content
    ChatModelGPT4oMock.invoke.mockResolvedValueOnce(
      new AIMessageChunk({ content: JSON.stringify(mockedResponse) })
    )

    const result = await generateMessageWithLLM({
      ChatModelGPT4o: ChatModelGPT4oMock,
      communicationObjective: 'Remind patient of upcoming appointment. Ask patient to arrive 15 minutes early',
      personalizationInput: 'Patient Name: John, Appointment Time: 2:00 PM tomorrow',
      additionalInstructions: '',
      stakeholder: 'Patient',
      language: 'English'
    })

    expect(result).toMatchObject(mockedResponse)
    expect(ChatModelGPT4oMock.invoke).toHaveBeenCalledTimes(1)
  })

  it('should generate a message for medication instructions', async () => {
    const mockedResponse = {
      subject: 'Important Information About Your New Medication',
      message: 'Dear Sarah,\n\nYour new medication, Lisinopril, should be taken once daily with food. Please remember to monitor your blood pressure regularly and report any side effects to our office.\n\nSincerely,\nYour Care Team'
    }

    // Mock returning the AIMessageChunk with JSON stringified content
    ChatModelGPT4oMock.invoke.mockResolvedValueOnce(
      new AIMessageChunk({ content: JSON.stringify(mockedResponse) })
    )

    const result = await generateMessageWithLLM({
      ChatModelGPT4o: ChatModelGPT4oMock,
      communicationObjective: 'Provide medication instructions',
      personalizationInput: 'Patient Name: Sarah, Medication: Lisinopril',
      additionalInstructions: 'Emphasize the importance of blood pressure monitoring',
      stakeholder: 'Patient',
      language: 'English'
    })
    
    expect(result).toMatchObject(mockedResponse)
    expect(ChatModelGPT4oMock.invoke).toHaveBeenCalledTimes(1)
  })

  it('should generate a message in a different language', async () => {
    const mockedResponse = {
      subject: 'Recordatorio de su cita próxima',
      message: 'Estimado Carlos,\n\nEste es un recordatorio de su cita programada para mañana a las 10:00 AM. Por favor, llegue 15 minutos antes para completar cualquier papeleo necesario.\n\nSaludos cordiales,\nSu Equipo de Atención'
    }

    // Mock returning the AIMessageChunk with JSON stringified content
    ChatModelGPT4oMock.invoke.mockResolvedValueOnce(
      new AIMessageChunk({ content: JSON.stringify(mockedResponse) })
    )

    const result = await generateMessageWithLLM({
      ChatModelGPT4o: ChatModelGPT4oMock,
      communicationObjective: 'Remind patient of upcoming appointment',
      personalizationInput: 'Patient Name: Carlos, Appointment Time: 10:00 AM tomorrow',
      additionalInstructions: 'Ask patient to arrive 15 minutes early',
      stakeholder: 'Patient',
      language: 'Spanish'
    })

    expect(result).toMatchObject(mockedResponse)
    expect(ChatModelGPT4oMock.invoke).toHaveBeenCalledTimes(1)
  })
})
