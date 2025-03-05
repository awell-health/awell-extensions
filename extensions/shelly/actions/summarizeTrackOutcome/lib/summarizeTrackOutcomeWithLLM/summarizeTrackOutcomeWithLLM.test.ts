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
    const pathwayId = process.env.TEST_PATHWAY_ID ?? '2j8WrgtxgR0a'
    const trackId = process.env.TEST_TRACK_ID ?? 'xhhtqphVOhsv'
    const currentActivityId = process.env.TEST_ACTIVITY_ID ?? 'meYKu8o7jcA9xKGCpSy6d'
    const careFlowDefinitionId = process.env.TEST_CARE_FLOW_DEFINITION_ID ?? '123'
    const tenantId = process.env.TEST_TENANT_ID ?? '123'

    console.log('\n=== Test Configuration ===')
    console.log('Pathway ID:', pathwayId)
    console.log('Track ID:', trackId)
    console.log('Current Activity ID:', currentActivityId)
    console.log('Care Flow Definition ID:', careFlowDefinitionId)
    console.log('Tenant ID:', tenantId)

    // Get real track data
    console.log('\n=== Fetching Track Data ===')
    const trackData = await getTrackData({
      awellSdk,
      pathwayId,
      trackId,
      currentActivityId,
    })

    console.log('\n=== Track Information ===')
    console.log('Track:', JSON.stringify(trackData.track, null, 2))
    
    console.log('\n=== Steps Information ===')
    console.log('Steps:', JSON.stringify(trackData.steps, null, 2))
    
    console.log('\n=== Activities Information ===')
    console.log('Activities:', JSON.stringify(trackData.activities, null, 2))
    
    console.log('\n=== Decision Path ===')
    console.log('Decision Path:', JSON.stringify(trackData.decisionPath, null, 2))

    // Create OpenAI model instance
    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
    })

    // Create proper metadata object
    const metadata: AIActionMetadata = {
      activity_id: currentActivityId,
      care_flow_definition_id: careFlowDefinitionId,
      care_flow_id: pathwayId,
      tenant_id: tenantId,
      track_id: trackId,
      step_id: trackData.activities[0]?.context?.step_id ?? '',
      action_id: currentActivityId,
      org_slug: process.env.TEST_ORG_SLUG ?? '',
      org_id: process.env.TEST_ORG_ID ?? '',
    }

    console.log('\n=== Metadata ===')
    console.log('Metadata:', JSON.stringify(metadata, null, 2))

    // Generate summary using real OpenAI
    console.log('\n=== Generating Summary ===')
    const summary = await summarizeTrackOutcomeWithLLM({
      model,
      careFlowActivities: JSON.stringify(trackData.activities),
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
  }, 30000) // Increased timeout for real API calls
}) 