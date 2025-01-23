import 'dotenv/config'
import { categorizeMessageWithLLM } from './'
import { type ChatOpenAI } from '@langchain/openai'

describe('categorizeMessageWithLLM', () => {
  let ChatModelGPT4oMiniMock: jest.Mocked<ChatOpenAI>

  beforeEach(() => {
    ChatModelGPT4oMiniMock = {
      pipe: jest.fn().mockReturnThis(),
      invoke: jest.fn(),
    } as unknown as jest.Mocked<ChatOpenAI>
  })

  it('should categorize a message about scheduling an appointment using real LLM', async () => {
    ChatModelGPT4oMiniMock.invoke.mockResolvedValue({
      // @ts-expect-error it's fine, we have a parser
      matched_category: 'Appointment Scheduling',
      match_explanation:
        'The message contains a request for scheduling an appointment.',
    })

    const categories = [
      'Appointment Scheduling',
      'Medical Symptoms Inquiry',
      'Medication Questions',
      'Administrative Assistance',
    ]
    const message = 'I would like to schedule an appointment for next week.'

    const result = await categorizeMessageWithLLM({
      ChatModelGPT4oMini: ChatModelGPT4oMiniMock,
      message,
      categories,
      metadata: {
        care_flow_definition_id: 'test-def-id',
        care_flow_id: 'test-pathway-id',
        activity_id: 'test-activity-id'
      }
    })

    expect(result.category).toBe('Appointment Scheduling')
  })

  it('should categorize a message about medication using real LLM', async () => {
    ChatModelGPT4oMiniMock.invoke.mockResolvedValue({
      // @ts-expect-error it's fine, we have a parser
      matched_category: 'Medication Questions',
      match_explanation:
        'The message contains a request for medication information.',
    })

    const categories = [
      'Appointment Scheduling',
      'Medical Symptoms Inquiry',
      'Medication Questions',
      'Administrative Assistance',
    ]
    const message = 'Can you tell me the correct dosage for my medication?'

    const result = await categorizeMessageWithLLM({
      ChatModelGPT4oMini: ChatModelGPT4oMiniMock,
      message,
      categories,
      metadata: {
        care_flow_definition_id: 'test-def-id',
        care_flow_id: 'test-pathway-id',
        activity_id: 'test-activity-id'
      }
    })

    expect(result.category).toBe('Medication Questions')
  })

  it('should return "None" when the message does not match any category using real LLM', async () => {
    ChatModelGPT4oMiniMock.invoke.mockResolvedValue({
      // @ts-expect-error it's fine, we have a parser
      matched_category: 'None',
      match_explanation:
        'The message does not contain any information about scheduling or medication.',
    })

    const categories = [
      'Appointment Scheduling',
      'Medical Symptoms Inquiry',
      'Medication Questions',
      'Administrative Assistance',
    ]
    const message = 'Is it going to rain tomorrow?'

    const result = await categorizeMessageWithLLM({
      ChatModelGPT4oMini: ChatModelGPT4oMiniMock,
      message,
      categories,
      metadata: {
        care_flow_definition_id: 'test-def-id',
        care_flow_id: 'test-pathway-id',
        activity_id: 'test-activity-id'
      }
    })

    expect(result.category).toBe('None')
  })
})
