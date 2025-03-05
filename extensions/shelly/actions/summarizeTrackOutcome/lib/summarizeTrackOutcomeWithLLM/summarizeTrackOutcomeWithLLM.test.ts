import 'dotenv/config'
import { AwellSdk } from '@awell-health/awell-sdk'
import { ChatOpenAI } from '@langchain/openai'
import { summarizeTrackOutcomeWithLLM } from './summarizeTrackOutcomeWithLLM'
import { getTrackData } from '../../../../lib/getTrackData/getTrackData'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'

describe('summarizeTrackOutcomeWithLLM', () => {
  it('should generate a summary using real data', async () => {
    // Initialize Awell SDK with your development credentials
    const awellSdk = new AwellSdk({
      apiKey: process.env.AWELL_API_KEY ?? '',
      environment: 'development',
    })

    // Replace these with actual IDs from your development environment
    const pathwayId = process.env.TEST_PATHWAY_ID ?? 'xQ2P4uBn2cY8'
    const trackId = process.env.TEST_TRACK_ID ?? 'C6f7O9cDWZIP'
    const currentActivityId = process.env.TEST_ACTIVITY_ID ?? '2XomvSblmj7ZQUklvdpPE'
    const careFlowDefinitionId = process.env.TEST_CARE_FLOW_DEFINITION_ID ?? '123'
    const tenantId = process.env.TEST_TENANT_ID ?? '123'

    console.log('\n=== Test Configuration ===')
    console.log('Pathway ID:', pathwayId)
    console.log('Track ID:', trackId)
    console.log('Current Activity ID:', currentActivityId)
    console.log('Tenant ID:', tenantId)

    // Fetch pathway definition details
    console.log('\n=== Fetching Pathway Definition Details ===')
    const pathwayDetails = await awellSdk.orchestration.query({
      pathway: {
        __args: {
          id: pathwayId,
        },
        code: true,
        success: true,
        pathway: {
          id: true,
          title: true,
          pathway_definition_id: true,
          release_id: true,
          version: true,
          status: true
        },
      },
    })

    console.log('\n=== Full Pathway Response ===')
    console.log('Pathway response:', JSON.stringify(pathwayDetails, null, 2))

    console.log('\n=== Pathway Definition Details ===')
    console.log('Care Flow Title:', pathwayDetails.pathway?.pathway?.title)
    console.log('Care Flow Definition ID:', pathwayDetails.pathway?.pathway?.pathway_definition_id)
    console.log('Care Flow Version:', pathwayDetails.pathway?.pathway?.version)
    console.log('Care Flow Release ID:', pathwayDetails.pathway?.pathway?.release_id)
    console.log('Care Flow Status:', pathwayDetails.pathway?.pathway?.status)

    // Print the disclaimer message that would be used
    console.log('\n=== Disclaimer Message ===')
    const disclaimerMsg = `Important Notice: The content provided is an AI-generated summary of Care Flow "${pathwayDetails.pathway?.pathway?.title ?? 'Unknown'}" (ID: ${pathwayDetails.pathway?.pathway?.pathway_definition_id ?? 'Unknown'}).`
    console.log(disclaimerMsg)

    // Get real track data
    console.log('\n=== Fetching Track Data ===')
    const trackData = await getTrackData({
      awellSdk,
      pathwayId,
      trackId,
      currentActivityId,
    })

    // Log the cleaned track data
    console.log('\n=== Cleaned Track Data ===')
    console.log(JSON.stringify(trackData, null, 2))

    // Create metadata for the LLM
    const metadata: AIActionMetadata = {
      activity_id: currentActivityId,
      care_flow_definition_id: pathwayDetails.pathway?.pathway?.pathway_definition_id ?? careFlowDefinitionId,
      care_flow_id: pathwayId,
      tenant_id: tenantId,
      track_id: trackId,
      step_id: '',
      action_id: currentActivityId,
      org_slug: '',
      org_id: '',
    }

    // Initialize the LLM model
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o',
      temperature: 0,
    })

    console.log('\n=== Metadata ===')
    console.log('Metadata:', JSON.stringify(metadata, null, 2))

    // Generate summary using real OpenAI
    console.log('\n=== Generating Summary ===')
    const summary = await summarizeTrackOutcomeWithLLM({
      model,
      trackActivities: JSON.stringify(trackData),
      instructions: 'Please provide a detailed summary of the track outcome and decision path.',
      metadata,
      callbacks: [],
    })

    // Basic validation
    expect(summary).toBeDefined()
    expect(typeof summary).toBe('string')
    expect(summary.length).toBeGreaterThan(0)
    expect(summary).toContain('## Outcome:')
    expect(summary).toContain('## Details supporting the outcome:')

    // Log the actual summary for manual review
    console.log('\n=== Generated Summary ===')
    console.log(summary)

    // Test the complete output with disclaimer
    console.log('\n=== Complete Output (with Disclaimer) ===')
    console.log(`${disclaimerMsg}\n\n${summary}`)
  }, 30000) // Increased timeout for real API calls
}) 