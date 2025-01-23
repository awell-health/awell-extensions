import 'dotenv/config'
import { generateMessageWithLLM } from '.'
import { createOpenAIModel } from '../../../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../../../src/lib/llm/openai/constants'        
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'

jest.setTimeout(60000) // Increases timeout to 60 seconds for all tests in this file

describe.skip('generateMessageWithLLM with real OpenAI', () => {
  let model: Awaited<ReturnType<typeof createOpenAIModel>>

  beforeEach(async () => {
    model = await createOpenAIModel({
      settings: {
        openAiApiKey: process.env.OPENAI_API_KEY,
      },
      modelType: OPENAI_MODELS.GPT4o,
      helpers: {
        getOpenAIConfig: () => ({ apiKey: process.env.OPENAI_API_KEY ?? '' }),
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
    const result = await generateMessageWithLLM({
      model: model.model,
      communicationObjective: 'Remind patient of upcoming appointment. Ask patient to arrive 15 minutes early',
      personalizationInput: 'Patient Name: John, Appointment Time: 2:00 PM tomorrow',
      stakeholder: 'Patient',
      language: 'English',
      metadata: model.metadata
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('message')
    expect(result.subject).toContain('Appointment')
    expect(result.message).toContain('John')
    expect(result.message).toContain('2:00 PM')
    expect(result.message).toContain('15 minutes early')
  })

  it('should generate a message for medication instructions', async () => {
    const result = await generateMessageWithLLM({
      model: model.model,
      communicationObjective: 'Provide medication instructions. Emphasize the importance of blood pressure monitoring',
      personalizationInput: 'Patient Name: Sarah, Medication: Lisinopril',
      stakeholder: 'Patient',
      language: 'English',
      metadata: model.metadata
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('message')
    expect(result.subject).toContain('Medication')
    expect(result.message).toContain('Sarah')
    expect(result.message).toContain('Lisinopril')
    expect(result.message).toContain('blood pressure')
  })

  it('should generate a message in Spanish', async () => {
    const result = await generateMessageWithLLM({
      model: model.model,
      communicationObjective: 'Remind patient of upcoming appointment. Ask patient to arrive 15 minutes early',
      personalizationInput: 'Patient Name: Carlos, Appointment Time: 10:00 AM tomorrow',
      stakeholder: 'Patient',
      language: 'Spanish',
      metadata: model.metadata
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('message')
    expect(result.subject).toContain('cita')
    expect(result.message).toContain('Carlos')
    expect(result.message).toContain('10:00 AM')
    expect(result.message).toContain('15 minutos')
  })
})
