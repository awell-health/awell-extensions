import 'dotenv/config'
import { categorizeMessageWithLLM } from './'
import { type OpenAI } from '@langchain/openai'

describe('categorizeMessageWithLLM', () => {
  let langChainOpenAiSdkMock: jest.Mocked<OpenAI>

  beforeEach(() => {
    // Create a mock for langChainOpenAiSdk
    langChainOpenAiSdkMock = {
      pipe: jest.fn().mockReturnThis(), // Mocks the pipe method and returns itself to chain invoke
      invoke: jest.fn(), // Will mock this separately for each test
    } as unknown as jest.Mocked<OpenAI>
  })

  it('should categorize a message about scheduling an appointment using real LLM', async () => {
    langChainOpenAiSdkMock.invoke.mockResolvedValue({
      // @ts-expect-error it's fine, we have a parser
      matched_entity: 'Appointment Scheduling',
    })

    const categories = [
      'Appointment Scheduling',
      'Medical Symptoms Inquiry',
      'Medication Questions',
      'Administrative Assistance',
    ]
    const message = 'I would like to schedule an appointment for next week.'

    const result = await categorizeMessageWithLLM({
      langChainOpenAiSdk: langChainOpenAiSdkMock,
      message,
      categories,
    })

    expect(result).toBe('Appointment Scheduling') // Expected category
  })

  it('should categorize a message about medication using real LLM', async () => {
    langChainOpenAiSdkMock.invoke.mockResolvedValue({
      // @ts-expect-error it's fine, we have a parser
      matched_entity: 'Medication Questions',
    })

    const categories = [
      'Appointment Scheduling',
      'Medical Symptoms Inquiry',
      'Medication Questions',
      'Administrative Assistance',
    ]
    const message = 'Can you tell me the correct dosage for my medication?'

    const result = await categorizeMessageWithLLM({
      langChainOpenAiSdk: langChainOpenAiSdkMock,
      message,
      categories,
    })

    expect(result).toBe('Medication Questions') // Expected category
  })

  it('should return "None" when the message does not match any category using real LLM', async () => {
    langChainOpenAiSdkMock.invoke.mockResolvedValue({
      // @ts-expect-error it's fine, we have a parser
      matched_entity: 'None',
    })

    const categories = [
      'Appointment Scheduling',
      'Medical Symptoms Inquiry',
      'Medication Questions',
      'Administrative Assistance',
    ]
    const message = 'Is it going to rain tomorrow?' // Non-related medical category

    const result = await categorizeMessageWithLLM({
      langChainOpenAiSdk: langChainOpenAiSdkMock,
      message,
      categories,
    })

    expect(result).toBe('None') // No match expected
  })
})
