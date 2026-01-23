import { sendMessageToChannel as actionObject } from './sendMessageToChannel'
import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../../client/slackClient')

describe('Send Message to Channel action', () => {
  const { onComplete, onError, helpers, clearMocks, extensionAction: sendMessageToChannel } = TestHelpers.fromAction(actionObject)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
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
})
