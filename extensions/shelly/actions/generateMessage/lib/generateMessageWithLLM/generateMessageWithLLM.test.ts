import 'dotenv/config'
import { generateMessageWithLLM } from './generateMessageWithLLM'
import { type ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk } from '@langchain/core/messages'
import { createOpenAIModel } from '../../../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../../../src/lib/llm/openai/constants'

describe('generateMessageWithLLM', () => {
  let mockModel: jest.Mocked<ChatOpenAI>
  let model: Awaited<ReturnType<typeof createOpenAIModel>>

  beforeEach(async () => {
    mockModel = {
      pipe: jest.fn().mockReturnThis(),
      invoke: jest.fn(),
    } as unknown as jest.Mocked<ChatOpenAI>

    model = await createOpenAIModel({
      settings: {
        openAiApiKey: 'test-key',
      },
      modelType: OPENAI_MODELS.GPT4o,
      helpers: {
        getOpenAIConfig: () => ({ apiKey: 'test-key' }),
      },
      payload: {
        pathway: {} as any,
        activity: {} as any,
        patient: {} as any,
        settings: {},
      },
    })
  })

  it('should generate a message for a patient appointment reminder', async () => {
    const mockedResponse = {
      subject: 'Your Upcoming Appointment Reminder',
      message: 'Dear John,\n\nThis is a reminder about your appointment scheduled for tomorrow at 2:00 PM. Please arrive 15 minutes early to complete any necessary paperwork.\n\nBest regards,\nYour Care Team'
    }

    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk({ content: JSON.stringify(mockedResponse) })
    )

    const result = await generateMessageWithLLM({
      model: mockModel,
      communicationObjective: 'Remind patient of upcoming appointment. Ask patient to arrive 15 minutes early',
      personalizationInput: 'Patient Name: John, Appointment Time: 2:00 PM tomorrow',
      stakeholder: 'Patient',
      language: 'English',
      metadata: model.metadata
    })

    expect(result).toMatchObject(mockedResponse)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
    expect(mockModel.invoke).toHaveBeenCalledWith(
      expect.any(String),
      { metadata: model.metadata, runName: 'ShellyGenerateMessage' }
    )
  })

  it('should generate a message for medication instructions', async () => {
    const mockedResponse = {
      subject: 'Important Information About Your New Medication',
      message: 'Dear Sarah,\n\nYour new medication, Lisinopril, should be taken once daily with food. Please remember to monitor your blood pressure regularly and report any side effects to our office.\n\nSincerely,\nYour Care Team'
    }

    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk({ content: JSON.stringify(mockedResponse) })
    )

    const result = await generateMessageWithLLM({
      model: mockModel,
      communicationObjective: 'Provide medication instructions. Emphasize the importance of blood pressure monitoring',
      personalizationInput: 'Patient Name: Sarah, Medication: Lisinopril',
      stakeholder: 'Patient',
      language: 'English',
      metadata: model.metadata
    })
    
    expect(result).toMatchObject(mockedResponse)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
  })

  it('should generate a message in a different language', async () => {
    const mockedResponse = {
      subject: 'Recordatorio de su cita próxima',
      message: 'Estimado Carlos,\n\nEste es un recordatorio de su cita programada para mañana a las 10:00 AM. Por favor, llegue 15 minutos antes para completar cualquier papeleo necesario.\n\nSaludos cordiales,\nSu Equipo de Atención'
    }

    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk({ content: JSON.stringify(mockedResponse) })
    )

    const result = await generateMessageWithLLM({
      model: mockModel,
      communicationObjective: 'Remind patient of upcoming appointment. Ask patient to arrive 15 minutes early',
      personalizationInput: 'Patient Name: Carlos, Appointment Time: 10:00 AM tomorrow',
      stakeholder: 'Patient',
      language: 'Spanish',
      metadata: model.metadata
    })

    expect(result).toMatchObject(mockedResponse)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
  })

  it('should handle retry logic when initial response is invalid', async () => {
    const invalidResponse = { content: 'invalid json' }
    const validResponse = {
      subject: 'Valid Subject',
      message: 'Valid Message'
    }

    mockModel.invoke
      .mockResolvedValueOnce(new AIMessageChunk(invalidResponse))
      .mockResolvedValueOnce(new AIMessageChunk({ content: JSON.stringify(validResponse) }))

    const result = await generateMessageWithLLM({
      model: mockModel,
      communicationObjective: 'Test objective',
      personalizationInput: 'Test input',
      stakeholder: 'Patient',
      language: 'English',
      metadata: model.metadata
    })

    expect(result).toMatchObject(validResponse)
    expect(mockModel.invoke).toHaveBeenCalledTimes(2)
  })
})
