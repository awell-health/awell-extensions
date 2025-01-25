import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { categorizeMessage } from '.'
import { ChatOpenAI } from '@langchain/openai'

// Mock the module
jest.mock('@langchain/openai', () => {
  const mockInvoke = jest.fn().mockResolvedValue({
    matched_category: 'None',
    match_explanation: 'Categorization was ambiguous; we could not find a proper category.'
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

describe('categorizeMessage - Mocked LLM calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(categorizeMessage)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('should work', async () => {
    const categorizeMessageWithLLMSpy = jest.spyOn(
      require('./lib/categorizeMessageWithLLM'),
      'categorizeMessageWithLLM'
    )

    const payload = generateTestPayload({
      fields: {
        message: 'test message',
        categories: 'category1,category2'
      },
      settings: {
        openAiApiKey: 'test-key'
      },
      pathway: {
        id: 'test-pathway-id',
        definition_id: 'test-def-id',
        tenant_id: 'test-tenant-id',
        org_slug: 'test-org-slug',
        org_id: 'test-org-id'
      },
      activity: {
        id: 'test-activity-id'
      }
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(ChatOpenAI).toHaveBeenCalled()
    expect(categorizeMessageWithLLMSpy).toHaveBeenCalledWith({
      model: expect.any(Object),
      message: 'test message',
      categories: ['category1', 'category2'],
      metadata: {
        care_flow_definition_id: 'test-def-id',
        care_flow_id: 'test-pathway-id',
        activity_id: 'test-activity-id',
        tenant_id: 'test-tenant-id',
        org_slug: 'test-org-slug',
        org_id: 'test-org-id'
      },
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        category: 'None',
        explanation: '<p>Categorization was ambiguous; we could not find a proper category.</p>',
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })
})
