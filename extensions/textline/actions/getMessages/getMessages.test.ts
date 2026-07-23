import { getMessages } from './getMessages'
import { generateTestPayload } from '@/tests'
import { mockReturnValue } from '../../client/__mocks__/textLineApi'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../client/textLineApi', () => jest.fn(() => mockReturnValue))

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
          phoneNumber: '+18999999999',
          afterMessageId: undefined,
          departmentId: undefined,
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allMessages: '["Yes","Received"]',
        numberOfMessages: '2',
        latestMessage: 'Yes',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback with zero answers', async () => {
    await getMessages.onEvent!({
      payload: generateTestPayload({
        fields: {
          phoneNumber: '+19144542596',
          afterMessageId: undefined,
          departmentId: undefined,
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allMessages: '',
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
          phoneNumber: undefined,
          afterMessageId: undefined,
          departmentId: undefined,
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allMessages: '',
        numberOfMessages: '0',
        latestMessage: undefined,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
