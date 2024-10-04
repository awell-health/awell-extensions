import 'dotenv/config'
import { generateMessageWithLLM } from '.'
import { ChatOpenAI } from '@langchain/openai'

jest.setTimeout(60000); // Increases timeout to 60 seconds for all tests in this file


describe.skip('generateMessageWithLLM', () => {
  let ChatModelGPT4o: ChatOpenAI

  beforeEach(() => {
    ChatModelGPT4o = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0,
      timeout: 10000,
    })
  })

  it('should generate a message for a patient appointment reminder', async () => {
    const result = await generateMessageWithLLM({
      ChatModelGPT4o,
      communicationObjective: 'Remind patient of upcoming appointment. Ask patient to arrive 15 minutes early',
      personalizationInput: 'Patient Name: John, Appointment Time: 2:00 PM tomorrow',
      stakeholder: 'Patient',
      language: 'English'
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
      ChatModelGPT4o,
      communicationObjective: 'Provide medication instructions. Emphasize the importance of blood pressure monitoring',
      personalizationInput: 'Patient Name: Sarah, Medication: Lisinopril',
      stakeholder: 'Patient',
      language: 'English'
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('message')
    expect(result.subject).toContain('Medication')
    expect(result.message).toContain('Sarah')
    expect(result.message).toContain('Lisinopril')
    expect(result.message).toContain('blood pressure')
  })

  it('should generate a message in a different language', async () => {
    const result = await generateMessageWithLLM({
      ChatModelGPT4o,
      communicationObjective: 'Remind patient of upcoming appointment. Ask patient to arrive 15 minutes early',
      personalizationInput: 'Patient Name: Carlos, Appointment Time: 10:00 AM tomorrow',
      stakeholder: 'Patient',
      language: 'Spanish'
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('message')
    expect(result.subject).toContain('cita')
    expect(result.message).toContain('Carlos')
    expect(result.message).toContain('10:00 AM')
    expect(result.message).toContain('15 minutos')
  })
})
