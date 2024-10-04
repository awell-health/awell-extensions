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
  let ChatModelGPT4oMock: jest.Mocked<ChatOpenAI>

  beforeEach(() => {
    // Define the 'invoke' method in the mock
    ChatModelGPT4oMock = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<ChatOpenAI>
  })

  it('should return a mocked summary for the General Health Questionnaire with Bullet-points format', async () => {
    const mockedSummary =
      'Patient reports persistent sharp lower back pain for two weeks, exacerbated by bending or lifting, with numbness in the right leg. No recent injuries but has started a new job involving heavy lifting.'

    // Mock the 'invoke' method to return an AIMessage
    ChatModelGPT4oMock.invoke.mockResolvedValueOnce(
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

    const summaryFormat = 'Bullet-points'
    const language = 'Default'
    const disclaimerMessage = 'This is a test disclaimer message.'

    const summary = await summarizeFormWithLLM({
      ChatModelGPT4o: ChatModelGPT4oMock,
      formData: formData,
      summaryFormat,
      language,
      disclaimerMessage
    })

    console.log('Summary', summary)

    expect(summary).toBe(mockedSummary)
    expect(ChatModelGPT4oMock.invoke).toHaveBeenCalledTimes(1)
  })

  it('should return a mocked summary for the General Health Questionnaire with Text paragraph format', async () => {
    const mockedSummary =
      'The patient has been experiencing persistent back pain for two weeks, describing it as a sharp pain in the lower back that worsens when bending or lifting. Over-the-counter painkillers have been ineffective. While there are no recent injuries, the patient started a new job requiring heavy lifting. Additionally, the patient reports occasional numbness in the right leg.'

    ChatModelGPT4oMock.invoke.mockResolvedValueOnce(
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

    const summaryFormat = 'Text paragraph'
    const language = 'Default'
    const disclaimerMessage = 'This is a test disclaimer message.'

    const summary = await summarizeFormWithLLM({
      ChatModelGPT4o: ChatModelGPT4oMock,
      formData: formData,
      summaryFormat,
      language,
      disclaimerMessage
    })

    console.log('Summary', summary)

    expect(summary).toBe(mockedSummary)
    expect(ChatModelGPT4oMock.invoke).toHaveBeenCalledTimes(1)
  })

  it('should return a mocked summary for the General Health Questionnaire with default format when not specified', async () => {
    const mockedSummary =
      '- **Reason for visit** - Persistent back pain for two weeks\n- **Nature of back pain** - Sharp pain in lower back, worse when bending or lifting\n- **Medications/treatments** - Over-the-counter painkillers, ineffective\n- **Recent injuries/accidents** - None, but started new job with heavy lifting\n- **Other symptoms** - Occasional numbness in right leg'

    ChatModelGPT4oMock.invoke.mockResolvedValueOnce(
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

    const language = 'Default'
    const disclaimerMessage = 'This is a test disclaimer message.'

    const summary = await summarizeFormWithLLM({
      ChatModelGPT4o: ChatModelGPT4oMock,
      formData: formData,
      summaryFormat: 'undefined',
      language,
      disclaimerMessage
    })

    console.log('Summary', summary)

    expect(summary).toBe(mockedSummary)
    expect(ChatModelGPT4oMock.invoke).toHaveBeenCalledTimes(1)
  })
})
