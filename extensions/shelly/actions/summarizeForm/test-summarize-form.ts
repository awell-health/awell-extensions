import { AwellSdk } from '@awell-health/awell-sdk'
import { type Helpers, type OnErrorCallback, type OnCompleteCallback } from '@awell-health/extensions-core'
import { Agent } from 'https'
import dotenv from 'dotenv'
import { summarizeForm } from './summarizeForm'

// Load environment variables
dotenv.config()

// Test payload with hardcoded IDs and required fields
const testPayload = {
  activity: {
    id: '3efUFaZGhY1YgcJEL8l7P'
  },
  pathway: {
    id: 'avHGnjR5wTNL',
    org_slug: 'awell-dev',
    org_id: 'organization-test',
    definition_id: 'test-def',
    tenant_id: 'test-tenant'
  },
  patient: {
    id: 'test-patient',
    profile: {
      identifier: [],
      sex: 'NOT_KNOWN' as const,
      preferred_language: 'en',
      mobile_phone: '',
      last_name: '',
      phone: '',
      email: '',
      patient_code: '',
      first_name: 'Test Patient',
      national_registry_number: '',
      address: {
        state: '',
        country: '',
        street: '',
        zip: '',
        city: ''
      }
    }
  },
  settings: {},
  fields: {
    summaryFormat: 'Bullet-points',
    language: 'en'
  }
}

async function testSummarizeForm(): Promise<void> {
  console.log('\n=== Starting Summarize Form Test ===\n')
  console.log('Starting test with payload:', JSON.stringify(testPayload, null, 2))

  const apiKey = process.env.AWELL_API_KEY
  if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
    throw new Error('AWELL_API_KEY is not set in .env file')
  }
  console.log('API Key loaded successfully')

  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey === undefined || openaiKey === null || openaiKey.trim() === '') {
    throw new Error('OPENAI_API_KEY is not set in .env file')
  }
  console.log('OpenAI API Key loaded successfully')

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
    getOpenAIConfig: () => {
      console.log('Loading OpenAI configuration')
      return {
        apiKey: openaiKey,
        temperature: 0.7,
        maxRetries: 3,
        timeout: 30000
      }
    },
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
    // Create mock completion and error handlers
    const onComplete: OnCompleteCallback<'summary'> = async (params) => {
      if (params?.data_points?.summary) {
        console.log('\nSummary Generated Successfully!')
        console.log('\nHTML Summary:')
        console.log(params.data_points.summary)
      }
    }

    const onError: OnErrorCallback = async (error) => {
      console.error('\nError during summarization:', error)
    }

    // Execute the summarizeForm action
    console.log('\nExecuting summarizeForm action...')
    const handler = summarizeForm.onEvent
    if (!handler) {
      throw new Error('onEvent handler is not defined')
    }

    await handler({
      payload: testPayload,
      onComplete,
      onError,
      helpers
    })

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
void testSummarizeForm() 