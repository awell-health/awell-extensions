import { getMessages } from './getMessages'
import { generateTestPayload } from '@/tests'
import { mockReturnValue } from '../../client/__mocks__/textLineApi'

jest.mock('../../client/textLineApi', () => jest.fn(() => mockReturnValue))

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
          phoneNumber: '+18999999999',
          afterMessageId: undefined,
          departmentId: undefined,
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError
    )
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
    await getMessages.onActivityCreated!(
      generateTestPayload({
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
      onError
    )
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
    await getMessages.onActivityCreated!(
      generateTestPayload({
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
      onError
    )
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
