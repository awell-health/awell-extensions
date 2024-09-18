import { summarizeFormWithLLM } from './summarizeFormWithLLM'
import { ChatOpenAI } from '@langchain/openai'
import 'dotenv/config'

const settings = {
  openAiApiKey: process.env.OPENAI_TEST_KEY,
}

const ChatModelGPT4o = new ChatOpenAI({
  openAIApiKey: settings.openAiApiKey,
  modelName: 'gpt-4',
})

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
  'Mental Health Assessment': {
    questions: [
      'How have you been feeling emotionally over the past month?',
      'Have you lost interest in activities you usually enjoy?',
      'How is your sleep pattern?',
      'Have you experienced changes in appetite or weight?',
      'Have you had any thoughts of self-harm or harming others?',
    ],
    answers: [
      "I've been feeling very down and hopeless almost every day.",
      'Yes, I no longer find joy in painting or meeting friends.',
      'I either sleep too much or have trouble falling asleep.',
      "I've lost my appetite and have unintentionally lost weight.",
      "Sometimes I feel like I can't go on, but I haven't harmed myself.",
    ],
  },
}
// Set timeout to 20 seconds for all tests in this file
jest.setTimeout(20000);

// Remove .skip to run tests
describe.skip('summarizeFormWithLLM', () => {
  it('should generate a summary for the General Health Questionnaire', async () => {
    const formName = 'General Health Questionnaire'
    const form = sampleForms[formName]
    const formData = form.questions
      .map((question, index) => `Question: ${question}\nAnswer: ${form.answers[index]}\n`)
      .join('\n')

    const stakeholder = 'Clinician'
    const additionalInstructions = 'Highlight any critical symptoms and possible causes.'

    const summary = await summarizeFormWithLLM({
      ChatModelGPT4o,
      form_data: formData,
      stakeholder,
      additional_instructions: additionalInstructions,
    })

    expect(summary).toBeDefined()
    expect(typeof summary).toBe('string')
    expect(summary).toContain('painkillers')
    expect(summary).toContain('numbness')
  })

  it('should generate a summary for the Mental Health Assessment', async () => {
    const formName = 'Mental Health Assessment'
    const form = sampleForms[formName]
    const formData = form.questions
      .map((question, index) => `Question: ${question}\nAnswer: ${form.answers[index]}\n`)
      .join('\n')

    const stakeholder = 'Psychologist'
    const additionalInstructions = 'Focus on emotional state and any signs of depression or self-harm.'

    const summary = await summarizeFormWithLLM({
      ChatModelGPT4o,
      form_data: formData,
      stakeholder,
      additional_instructions: additionalInstructions,
    })

    expect(summary).toBeDefined()
    expect(typeof summary).toBe('string')
    expect(summary).toContain('sleep')
    expect(summary).toContain('self-harm')
  })
})
