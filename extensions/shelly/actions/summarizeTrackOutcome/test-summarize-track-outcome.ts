import { AwellSdk } from '@awell-health/awell-sdk'
import dotenv from 'dotenv'
import { summarizeTrackOutcome } from './summarizeTrackOutcome'
import { Agent } from 'https'
import fs from 'fs'
import path from 'path'

// Load environment variables from .env file
dotenv.config()

// Output file path for saving results
const OUTPUT_PATH = './summarize-track-outcome-output.json'

// Define the type for the data points
interface DataPoints {
  outcomeSummary: string
}

// Test payload with real data
const testPayload = {
  patient: {
    profile: {
      identifier: [],
      sex: "NOT_KNOWN" as const,
      preferred_language: "en",
      mobile_phone: "",
      phone: "",
      email: "test@example.com",
      patient_code: "",
      first_name: "Test",
      last_name: "Patient",
      national_registry_number: "",
      address: {
        state: "",
        country: "",
        street: "",
        zip: "",
        city: ""
      }
    },
    id: "test-patient-id"
  },
  activity: {
    id: "8eiWQSjyH00Txb8FsD306" // Use the same activity ID as before
  },
  pathway: {
    org_slug: "awell-dev",
    org_id: "organization-test-id",
    definition_id: "test-definition-id",
    id: "2ifb4DsPa1JQ", // Use the same pathway ID as before
    tenant_id: "test-tenant-id"
  },
  settings: {},
  fields: {
    instructions: "Summarize the track outcome and key activities that led to the outcome. Focus on the clinical journey and important events."
  }
}

/**
 * Test the summarizeTrackOutcome action
 */
async function testSummarizeTrackOutcome(): Promise<void> {
  console.log('=== TESTING SUMMARIZE TRACK OUTCOME ===')
  console.log('Starting test with payload:', JSON.stringify(testPayload, null, 2))

  // Check for API key
  const apiKey = process.env.AWELL_API_KEY
  if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
    throw new Error('AWELL_API_KEY is not set in .env file')
  }
  console.log('API Key loaded successfully')

  // Check for OpenAI API key
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (openaiApiKey === undefined || openaiApiKey === null || openaiApiKey.trim() === '') {
    console.warn('Warning: OPENAI_API_KEY is not set in .env file')
  } else {
    console.log('OpenAI API Key loaded successfully')
  }

  try {
    // Initialize SDK
    console.log('Initializing Awell SDK with sandbox environment')
    const awellSdk = new AwellSdk({
      apiKey,
      environment: 'sandbox',
    })
    console.log('SDK initialized successfully')

    // Get track ID from activity
    console.log(`Fetching activity details for ID: ${testPayload.activity.id}`)
    const activityResponse = await awellSdk.orchestration.query({
      activity: {
        __args: {
          id: testPayload.activity.id,
        },
        success: true,
        activity: {
          id: true,
          context: {
            track_id: true,
          },
        },
      },
    })
    
    console.log('Activity response:', JSON.stringify(activityResponse, null, 2))
    
    if (!activityResponse.activity?.success) {
      throw new Error('Failed to get activity details: API returned unsuccessful response')
    }
    
    const trackIdValue = activityResponse.activity?.activity?.context?.track_id
    if (typeof trackIdValue !== 'string' || trackIdValue.trim() === '') {
      throw new Error('Failed to get track ID: track_id is missing or empty in activity context')
    }
    
    const trackId = trackIdValue
    console.log(`Found track ID: ${trackId}`)
    
    // Import getTrackData dynamically
    console.log('Importing getTrackData module')
    const { getTrackData } = await import('../../lib/getTrackData')
    console.log('Module imported successfully')
    
    // Test getTrackData
    console.log('Fetching track data...')
    const trackData = await getTrackData({
      awellSdk,
      pathwayId: testPayload.pathway.id,
      trackId,
      currentActivityId: testPayload.activity.id,
    })
    console.log(`Track data fetched with ${trackData.steps.length} steps`)
    
    // Count total activities across all steps
    let totalActivities = 0
    for (const step of trackData.steps) {
      totalActivities += step.activities.length
    }
    
    console.log('Track data summary:', JSON.stringify({
      stepCount: trackData.steps.length,
      totalActivities: totalActivities
    }, null, 2))

    // Fetch pathway details directly to check if it works
    console.log('Fetching pathway details directly...')
    const pathwayDetails = await awellSdk.orchestration.query({
      pathway: {
        __args: {
          id: testPayload.pathway.id,
        },
        code: true,
        success: true,
        pathway: {
          id: true,
          title: true,
          pathway_definition_id: true,
          version: true,
        },
      },
    })
    console.log('Pathway details response:', JSON.stringify(pathwayDetails, null, 2))

    // Create helpers object
    console.log('Creating helpers object')
    const helpers = {
      awellSdk: async () => {
        console.log('Helper: Creating Awell SDK instance')
        return awellSdk
      },
      httpsAgent: () => new Agent(),
      getOpenAIConfig: () => {
        console.log('Helper: Loading OpenAI configuration')
        const config = {
          apiKey: openaiApiKey ?? '',
          temperature: 0.7,
          maxRetries: 3,
          timeout: 30000
        }
        console.log('Helper: OpenAI config loaded:', { ...config, apiKey: '[REDACTED]' })
        return config
      },
      getLangSmithConfig: () => {
        console.log('Helper: Loading LangSmith configuration')
        return {
          tracing: false,
          endpoint: '',
          apiKey: '',
          project: ''
        }
      },
      rateLimiter: {
        schedule: async (fn: () => Promise<any>) => {
          console.log('Helper: Rate limiter scheduling function')
          return await fn()
        }
      },
      logger: {
        info: (message: string): void => { console.log(`[INFO] ${message}`); },
        error: (message: string): void => { console.error(`[ERROR] ${message}`); },
        warn: (message: string): void => { console.warn(`[WARN] ${message}`); },
        debug: (message: string): void => { console.log(`[DEBUG] ${message}`); },
      }
    }

    // Monkey patch the awellSdk.orchestration.query method to log all queries
    const originalQuery = awellSdk.orchestration.query;
    awellSdk.orchestration.query = async (options: any) => {
      // Only log pathway queries
      if (options.pathway && options.pathway.__args && options.pathway.__args.id) {
        console.log('\n=== PATHWAY QUERY DETECTED ===');
        console.log('Query for pathway ID:', options.pathway.__args.id);
        console.log('Query details:', JSON.stringify(options.pathway, null, 2));
        
        // Add version field if this is the pathway details query from summarizeTrackOutcome
        if (options.pathway.pathway && !options.pathway.pathway.version) {
          console.log('Adding version field to pathway query');
          options.pathway.pathway.version = true;
        }
      }
      
      const result = await originalQuery(options);
      
      // Only log pathway query results
      if (options.pathway && options.pathway.__args && options.pathway.__args.id) {
        console.log('\n=== PATHWAY QUERY RESULT ===');
        console.log(JSON.stringify(result.pathway, null, 2));
      }
      
      return result;
    };

    // Create completion and error handlers
    console.log('Setting up completion and error handlers')
    let result: { data_points?: { outcomeSummary: string } } | null = null
    
    const onComplete = async (params: { data_points?: { outcomeSummary: string } }): Promise<void> => {
      console.log('\n=== ACTION COMPLETED ===');
      
      // Save both track data and summary to the output file
      const outputData = {
        trackData,
        pathwayDetails,
        summary: params
      }
      
      fs.writeFileSync(
        path.resolve(OUTPUT_PATH),
        JSON.stringify(outputData, null, 2)
      )
      console.log(`Results saved to ${OUTPUT_PATH}`);
      
      // Display summary preview
      if (params?.data_points?.outcomeSummary) {
        const plainTextSummary = params.data_points.outcomeSummary
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
        
        console.log('\n=== SUMMARY PREVIEW ===');
        console.log(plainTextSummary.substring(0, 500) + '...');
      }
    }

    const onError = async (error: { error?: { message: string } }): Promise<void> => {
      console.error('onError called with error:', error)
      if (error?.error?.message) {
        throw new Error(`Action execution failed: ${error.error.message}`)
      } else {
        throw new Error(`Action execution failed: ${JSON.stringify(error)}`)
      }
    }

    // Get the onEvent handler
    console.log('Getting onEvent handler from summarizeTrackOutcome')
    const handler = summarizeTrackOutcome.onEvent
    if (!handler) {
      throw new Error('onEvent handler is not defined')
    }
    console.log('Handler found, preparing to execute')

    // Execute the action
    console.log('\n=== EXECUTING SUMMARIZE TRACK OUTCOME ACTION ===');
    const startTime = performance.now();
    
    // Type assertion to bypass type checking for the test
    await handler({
      payload: testPayload as any,
      onComplete,
      onError,
      helpers: helpers as any
    });
    
    const executionTime = (performance.now() - startTime).toFixed(2);
    console.log(`Action executed in ${executionTime}ms`);
    
    console.log('\nTest completed successfully - see output file for full data structure.');
  } catch (error) {
    console.error('TEST EXECUTION ERROR:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
  }
}

// Run the test
console.log('Starting test execution')
void testSummarizeTrackOutcome()

/**
 * Note: If you still encounter TypeScript errors when running this script,
 * you can use the --transpile-only flag to bypass type checking:
 * 
 * yarn ts-node --transpile-only extensions/shelly/actions/summarizeTrackOutcome/test-summarize-track-outcome.ts
 */ 