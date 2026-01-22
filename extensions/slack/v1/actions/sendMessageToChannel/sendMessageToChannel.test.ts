import { sendMessageToChannel } from './sendMessageToChannel'
import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'

jest.mock('../../../client/slackClient')

describe('Send Message to Channel action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback with message details', async () => {
    await sendMessageToChannel.onActivityCreated!(
      generateTestPayload({
        fields: {
          channel: '#general',
          message: 'Hello from care flow!',
        },
        settings: {
          botToken: 'xoxb-test-token',
        },
      }),
      onComplete,
      onError
    )

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
    const resp = sendMessageToChannel.onActivityCreated!(
      generateTestPayload({
        fields: {
          channel: '',
          message: 'Hello from care flow!',
        },
        settings: {
          botToken: 'xoxb-test-token',
        },
      }),
      onComplete,
      onError
    )

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should throw ZodError when message is missing', async () => {
    const resp = sendMessageToChannel.onActivityCreated!(
      generateTestPayload({
        fields: {
          channel: '#general',
          message: '',
        },
        settings: {
          botToken: 'xoxb-test-token',
        },
      }),
      onComplete,
      onError
    )

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should throw ZodError when bot token is missing', async () => {
    const resp = sendMessageToChannel.onActivityCreated!(
      generateTestPayload({
        fields: {
          channel: '#general',
          message: 'Hello from care flow!',
        },
        settings: {
          botToken: '',
        },
      }),
      onComplete,
      onError
    )

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
