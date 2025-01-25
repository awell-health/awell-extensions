/* eslint-disable @typescript-eslint/no-var-requires */

import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { generateMessage } from '.'
import { type ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk } from '@langchain/core/messages'

jest.mock('../../../../src/lib/llm/openai/createOpenAIModel', () => ({
  createOpenAIModel: jest.fn().mockImplementation(({ modelType }) => ({
    model: {
      pipe: jest.fn().mockReturnThis(),
      invoke: jest.fn().mockResolvedValue({
        content: JSON.stringify({
          subject: 'Test Subject',
          message: 'This is a test message',
        })
      }),
    } as unknown as ChatOpenAI,
    metadata: {
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      activity_id: 'test-activity-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id',
      model: modelType
    }
  }))
}))

describe('generateMessage', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(generateMessage)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  it('should generate a message', async () => {
    const payload = generateTestPayload({
      fields: {
        communicationObjective: 'Reminder',
        stakeholder: 'Patient',
        language: 'English',
        personalizationInput: 'John Doe',
      },
      settings: {
        openAiApiKey: 'test_key',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        subject: 'Test Subject',
        message: '<p>This is a test message</p>',
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('should generate a message with default values', async () => {
    const payload = generateTestPayload({
      fields: {
        communicationObjective: 'Update clinician on their patient',
      },
      settings: {
        openAiApiKey: 'test_key',
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        subject: 'Test Subject',
        message: '<p>This is a test message</p>',
      },
    })

    expect(onError).not.toHaveBeenCalled()
  })

  it('should handle errors properly', async () => {
    const payload = generateTestPayload({
      fields: {
        communicationObjective: 'Invalid objective',
      },
      settings: {
        openAiApiKey: 'test_key',
      },
    })

    // Mock createOpenAIModel to throw an error for this test
    const createOpenAIModel = jest.requireMock('../../../../src/lib/llm/openai/createOpenAIModel').createOpenAIModel
    createOpenAIModel.mockRejectedValueOnce(new Error('Failed to create model'))

    await expect(
      extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
      })
    ).rejects.toThrow('Failed to create model')
  })
})
