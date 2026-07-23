import { getMessages } from './getMessages'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Get messages action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getMessages)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback with one answer', async () => {
    await getMessages.onEvent!({
      payload: generateTestPayload({
        fields: {
          recipient: '+19144542596',
          from: '+18999999999',
          date_sent_after: '2024-02-19',
          date_sent_before: undefined,
          date_sent: undefined,
          page_size: 30,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          clientId: 'clientId',
          messagingServiceSid: undefined,
          region: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allMessages: '["Yes"]',
        numberOfMessages: '1',
        latestMessage: 'Yes',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback with zero answers', async () => {
    await getMessages.onEvent!({
      payload: generateTestPayload({
        fields: {
          recipient: '+19144542596',
          from: '+18888888888',
          date_sent_after: undefined,
          date_sent_before: '2024-02-19',
          date_sent: undefined,
          page_size: 30,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          messagingServiceSid: undefined,
          clientId: undefined,
          region: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allMessages: '[]',
        numberOfMessages: '0',
        latestMessage: undefined,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete even with no params', async () => {
    await getMessages.onEvent!({
      payload: generateTestPayload({
        fields: {
          recipient: undefined,
          from: undefined,
          date_sent_after: undefined,
          date_sent_before: undefined,
          date_sent: undefined,
          page_size: undefined,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          clientId: undefined,
          messagingServiceSid: undefined,
          region: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allMessages: '[]',
        numberOfMessages: '0',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onFail when page size is negative', async () => {
    await getMessages.onEvent!({
      payload: generateTestPayload({
        fields: {
          recipient: undefined,
          from: undefined,
          date_sent_after: undefined,
          date_sent_before: undefined,
          date_sent: undefined,
          page_size: -1,
        },
        settings: {
          accountSid: 'AC-accountSid',
          authToken: 'authToken',
          fromNumber: '+19144542596',
          clientId: undefined,
          messagingServiceSid: undefined,
          region: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).not.toHaveBeenCalledWith()
    expect(onError).toHaveBeenCalled()
  })
})
