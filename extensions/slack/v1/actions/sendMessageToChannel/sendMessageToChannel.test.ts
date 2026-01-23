import { sendMessageToChannel as actionObject } from './sendMessageToChannel'
import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'
import { TestHelpers } from '@awell-health/extensions-core'
import { SlackClient } from '../../../client/slackClient'

jest.mock('../../../client/slackClient')

const MockedSlackClient = SlackClient as jest.MockedClass<typeof SlackClient>

describe('Send Message to Channel action', () => {
  const { onComplete, onError, helpers, clearMocks, extensionAction: sendMessageToChannel } = TestHelpers.fromAction(actionObject)

  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('Should call the onComplete callback with message details', async () => {
    await sendMessageToChannel.onEvent!({
      payload: generateTestPayload({
        fields: {
          channel: '#general',
          message: 'Hello from care flow!',
        },
        settings: {
          botToken: 'xoxb-test-token',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        messageTs: '1234567890.123456',
        channelId: 'C1234567890',
      },
      events: [
        expect.objectContaining({
          text: {
            en: 'Message sent to channel C1234567890',
          },
        }),
      ],
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should throw ZodError when channel is missing', async () => {
    const resp = sendMessageToChannel.onEvent!({
      payload: generateTestPayload({
        fields: {
          channel: '',
          message: 'Hello from care flow!',
        },
        settings: {
          botToken: 'xoxb-test-token',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should throw ZodError when message is missing', async () => {
    const resp = sendMessageToChannel.onEvent!({
      payload: generateTestPayload({
        fields: {
          channel: '#general',
          message: '',
        },
        settings: {
          botToken: 'xoxb-test-token',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should throw ZodError when bot token is missing', async () => {
    const resp = sendMessageToChannel.onEvent!({
      payload: generateTestPayload({
        fields: {
          channel: '#general',
          message: 'Hello from care flow!',
        },
        settings: {
          botToken: '',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should append care flow link to message with sandbox environment', async () => {
    process.env.AWELL_ENVIRONMENT = 'sandbox'

    await sendMessageToChannel.onEvent!({
      payload: generateTestPayload({
        fields: {
          channel: '#general',
          message: 'Hello from care flow!',
        },
        settings: {
          botToken: 'xoxb-test-token',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const mockInstance = MockedSlackClient.mock.results[0].value
    expect(mockInstance.postMessage).toHaveBeenCalledWith({
      channel: '#general',
      text: 'Hello from care flow!\n\n<https://care.sandbox.awellhealth.com/pathway/pathway-id/activity-feed|View Care Flow>',
    })
    expect(onComplete).toHaveBeenCalled()
  })

  test('Should append care flow link to message with production environment (empty string)', async () => {
    process.env.AWELL_ENVIRONMENT = ''

    await sendMessageToChannel.onEvent!({
      payload: generateTestPayload({
        fields: {
          channel: '#general',
          message: 'Hello from care flow!',
        },
        settings: {
          botToken: 'xoxb-test-token',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const mockInstance = MockedSlackClient.mock.results[0].value
    expect(mockInstance.postMessage).toHaveBeenCalledWith({
      channel: '#general',
      text: 'Hello from care flow!\n\n<https://care.awellhealth.com/pathway/pathway-id/activity-feed|View Care Flow>',
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
