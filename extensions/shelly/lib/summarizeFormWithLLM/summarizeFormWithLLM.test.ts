import 'dotenv/config'
import { summarizeFormWithLLM } from './summarizeFormWithLLM'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk } from '@langchain/core/messages'

const sampleForms = {
  'General Health Questionnaire': {
    questions: [
      'What brings you to the clinic today?',
      'Can you describe the nature of your back pain?',
      'Have you taken any medications or treatments for this pain?',
      'Have you had any recent injuries or accidents?',
      'Do you have any other symptoms or health concerns?',
    ],
    answers: [
      "I've been experiencing persistent back pain for the past two weeks.",
      "It's a sharp pain in my lower back, especially when I bend over or lift something.",
      "I've been taking over-the-counter painkillers, but they don't seem to help much.",
      'No recent injuries, but I started a new job that requires lifting heavy boxes.',
      'Sometimes I feel numbness in my right leg.',
    ],
  },
}

describe('summarizeFormWithLLM', () => {
  let mockModel: jest.Mocked<ChatOpenAI>

  beforeEach(() => {
    mockModel = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<ChatOpenAI>
  })

  it('should return a summary for the General Health Questionnaire with Bullet-points format', async () => {
    const mockedSummary =
      'Patient reports persistent sharp lower back pain for two weeks, exacerbated by bending or lifting, with numbness in the right leg. No recent injuries but has started a new job involving heavy lifting.'

    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk(mockedSummary)
    )

    const formName = 'General Health Questionnaire'
    const form = sampleForms[formName]
    const formData = form.questions
      .map(
        (question, index) =>
          `Question: ${question}\nAnswer: ${form.answers[index]}\n`
      )
      .join('\n')

    const metadata = {
      activity_id: 'test-activity-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    const summary = await summarizeFormWithLLM({
      model: mockModel,
      formData,
      summaryFormat: 'Bullet-points',
      language: 'Default',
      disclaimerMessage: 'This is a test disclaimer message.',
      metadata
    })

    expect(summary).toBe(mockedSummary)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
    expect(mockModel.invoke).toHaveBeenCalledWith(
      expect.anything(),
      { metadata, runName: 'ShellySummarizeForm' }
    )
  })

  it('should return a summary for the General Health Questionnaire with Text paragraph format', async () => {
    const mockedSummary =
      'The patient has been experiencing persistent back pain for two weeks, describing it as a sharp pain in the lower back that worsens when bending or lifting. Over-the-counter painkillers have been ineffective. While there are no recent injuries, the patient started a new job requiring heavy lifting. Additionally, the patient reports occasional numbness in the right leg.'

    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk(mockedSummary)
    )

    const formName = 'General Health Questionnaire'
    const form = sampleForms[formName]
    const formData = form.questions
      .map(
        (question, index) =>
          `Question: ${question}\nAnswer: ${form.answers[index]}\n`
      )
      .join('\n')

    const metadata = {
      activity_id: 'test-activity-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    const summary = await summarizeFormWithLLM({
      model: mockModel,
      formData,
      summaryFormat: 'Text paragraph',
      language: 'Default',
      disclaimerMessage: 'This is a test disclaimer message.',
      metadata
    })

    expect(summary).toBe(mockedSummary)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
    expect(mockModel.invoke).toHaveBeenCalledWith(
      expect.anything(),
      { metadata, runName: 'ShellySummarizeForm' }
    )
  })

  it('should handle errors gracefully', async () => {
    mockModel.invoke.mockRejectedValueOnce(new Error('API Error'))

    const formData = 'Test form data'
    const metadata = {
      activity_id: 'test-activity-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    await expect(
      summarizeFormWithLLM({
        model: mockModel,
        formData,
        summaryFormat: 'Bullet-points',
        language: 'Default',
        disclaimerMessage: 'This is a test disclaimer message.',
        metadata
      })
    ).rejects.toThrow('Failed to generate form summary')
  })
})
