import { getMessages } from './getMessages'
import { generateTestPayload } from '@/tests'

describe('Get messages action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback with one answer', async () => {
    await getMessages.onActivityCreated!(
      generateTestPayload({
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
          messagingServiceSid: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
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
    await getMessages.onActivityCreated!(
      generateTestPayload({
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
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
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
    await getMessages.onActivityCreated!(
      generateTestPayload({
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
          messagingServiceSid: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allMessages: '[]',
        numberOfMessages: '0',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onFail when page size is negative', async () => {
    await getMessages.onActivityCreated!(
      generateTestPayload({
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
          messagingServiceSid: undefined,
          addOptOutLanguage: undefined,
          optOutLanguage: undefined,
          language: undefined,
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalledWith()
    expect(onError).toHaveBeenCalled()
  })
})
