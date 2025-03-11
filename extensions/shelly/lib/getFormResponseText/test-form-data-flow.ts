import { AwellSdk } from '@awell-health/awell-sdk'
import { getLatestFormInCurrentStep } from '../../../../src/lib/awell'
import { getFormResponseText } from './getFormResponseText'
import { type Helpers } from '@awell-health/extensions-core'
import { Agent } from 'https'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Test payload with hardcoded IDs
const testPayload = {
  activity: {
    id: '3efUFaZGhY1YgcJEL8l7P'
  },
  pathway: {
    id: 'avHGnjR5wTNL'
  }
}

async function testFormDataFlow(): Promise<void> {
  console.log('\n=== Starting Form Data Flow Test ===\n')
  console.log('Starting test with payload:', JSON.stringify(testPayload, null, 2))

  const apiKey = process.env.AWELL_API_KEY
  if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
    throw new Error('AWELL_API_KEY is not set in .env file')
  }
  console.log('API Key loaded successfully')

  // Create helpers object similar to what the extension system provides
  const helpers: Helpers = {
    awellSdk: async () => {
      console.log('Creating Awell SDK instance')
      return new AwellSdk({
        apiKey,
        environment: 'development'
      })
    },
    httpsAgent: () => new Agent(),
    getOpenAIConfig: () => ({
      apiKey: '',
      temperature: 0.7,
      maxRetries: 3,
      timeout: 30000
    }),
    getLangSmithConfig: () => ({
      tracing: false,
      endpoint: '',
      apiKey: '',
      project: ''
    }),
    rateLimiter: () => ({
      consume: async () => ({
        success: true,
        result: {
          remainingPoints: 1000,
          msBeforeNext: 0,
          consumedPoints: 1,
          isFirstInDuration: false,
          toJSON: () => ({
            remainingPoints: 1000,
            msBeforeNext: 0,
            consumedPoints: 1,
            isFirstInDuration: false
          })
        }
      }),
      limit: async () => ({
        success: true,
        result: {
          remainingPoints: 1000,
          msBeforeNext: 0,
          consumedPoints: 1,
          isFirstInDuration: false,
          toJSON: () => ({
            remainingPoints: 1000,
            msBeforeNext: 0,
            consumedPoints: 1,
            isFirstInDuration: false
          })
        }
      }),
      reset: async () => {}
    })
  }

  try {
    // 1. Fetch form data using getLatestFormInCurrentStep
    console.log('\n1. Fetching form data...')
    console.log('Pathway ID:', testPayload.pathway.id)
    console.log('Activity ID:', testPayload.activity.id)
    
    const formData = await getLatestFormInCurrentStep({
      awellSdk: await helpers.awellSdk(),
      pathwayId: testPayload.pathway.id,
      activityId: testPayload.activity.id,
    })
    
    console.log('\nForm Activity Details:')
    console.log('- Form Activity ID:', formData.formActivityId)
    console.log('- Form ID:', formData.formId)
    
    // Log form definition structure
    console.log('\nForm Definition Structure:')
    console.log('- Total Questions:', formData.formDefinition.questions.length)
    console.log('\nQuestions Order in Definition:')
    formData.formDefinition.questions.forEach((q, idx) => {
      console.log(`${idx + 1}. [${q.id}] ${q.title}`)
    })
    
    // Log form response structure
    console.log('\nForm Response Structure:')
    console.log('- Total Answers:', formData.formResponse.answers.length)
    console.log('\nAnswers as Received:')
    formData.formResponse.answers.forEach((a, idx) => {
      console.log(`${idx + 1}. Question ID: ${a.question_id}, Value: ${a.value}`)
    })

    // 2. Process with getFormResponseText
    console.log('\n2. Processing with getFormResponseText...')
    const processedForm = getFormResponseText({
      formDefinition: formData.formDefinition,
      formResponse: formData.formResponse,
    })
    
    console.log('\nProcessed Form Results:')
    console.log('- Full Result:', processedForm.result)
    console.log('- Omitted Answers:', processedForm.omittedFormAnswers.length)
    
    if (processedForm.omittedFormAnswers.length > 0) {
      console.log('\nOmitted Answers:')
      processedForm.omittedFormAnswers.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.reason} (Question ID: ${item.questionId})`)
      })
    }

  } catch (error) {
    console.error('Test execution error:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    process.exit(1)
  }
}

// Run the test
console.log('Starting test execution')
void testFormDataFlow() 
console.log('Starting test execution')
void testFormDataFlow() 