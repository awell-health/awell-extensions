import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { parseStructuredData } from '.'
import { ChatOpenAI } from '@langchain/openai'

// Mock the module
jest.mock('@langchain/openai', () => {
  const mockInvoke = jest.fn().mockResolvedValue({
    extracted_data: {
      name: 'John Doe',
      age: 45,
      email: 'john.doe@example.com',
    },
    confidence_level: 85,
    extraction_explanation:
      'Successfully extracted all required fields from the message.',
  })

  const mockChain = {
    invoke: mockInvoke,
  }

  const mockPipe = jest.fn().mockReturnValue(mockChain)

  const mockChatOpenAI = jest.fn().mockImplementation(() => ({
    pipe: mockPipe,
  }))

  return {
    ChatOpenAI: mockChatOpenAI,
  }
})

describe('parseStructuredData - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(parseStructuredData)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('should work', async () => {
    const parseStructuredDataWithLLMSpy = jest.spyOn(
      require('./lib/parseStructuredDataWithLLM'),
      'parseStructuredDataWithLLM',
    )

    const payload = generateTestPayload({
      fields: {
        message: 'Patient name is John Doe, age 45, email john.doe@example.com',
        schema: JSON.stringify({
          name: 'string',
          age: 'number',
          email: 'string',
        }),
      },
      settings: {
        openAiApiKey: 'test-key',
      },
      pathway: {
        id: 'test-pathway-id',
        definition_id: 'test-def-id',
        tenant_id: 'test-tenant-id',
        org_slug: 'test-org-slug',
        org_id: 'test-org-id',
      },
      activity: {
        id: 'test-activity-id',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(ChatOpenAI).toHaveBeenCalled()
    expect(parseStructuredDataWithLLMSpy).toHaveBeenCalledWith({
      model: expect.any(Object),
      message: 'Patient name is John Doe, age 45, email john.doe@example.com',
      schema: {
        name: 'string',
        age: 'number',
        email: 'string',
      },
      metadata: {
        care_flow_definition_id: 'test-def-id',
        care_flow_id: 'test-pathway-id',
        activity_id: 'test-activity-id',
        tenant_id: 'test-tenant-id',
        org_slug: 'test-org-slug',
        org_id: 'test-org-id',
      },
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        parsedData: JSON.stringify({
          name: 'John Doe',
          age: 45,
          email: 'john.doe@example.com',
        }),
        confidenceLevel: '85',
        explanation:
          '<p>Successfully extracted all required fields from the message.</p>',
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('should handle missing message gracefully', async () => {
    const payload = generateTestPayload({
      fields: {
        message: '',
        messageDataPoint: '',
        schema: JSON.stringify({
          name: 'string',
          age: 'number',
        }),
      },
      settings: {
        openAiApiKey: 'test-key',
      },
      pathway: {
        id: 'test-pathway-id',
        definition_id: 'test-def-id',
        tenant_id: 'test-tenant-id',
        org_slug: 'test-org-slug',
        org_id: 'test-org-id',
      },
      activity: {
        id: 'test-activity-id',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Either message or messageDataPoint is required' },
          error: {
            category: 'BAD_REQUEST',
            message: 'Either message or messageDataPoint is required',
          },
        },
      ],
    })

    expect(onComplete).not.toHaveBeenCalled()
  })
})
