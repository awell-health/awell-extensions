import { getMessages } from './getMessages'
import { generateTestPayload } from '../../../../src/tests'
import { mockReturnValue } from '../../__mocks__/textLineApi'

jest.mock('../../textLineApi', () => jest.fn(() => mockReturnValue))

describe('Get messages action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback with one answer', async () => {
    await getMessages.onActivityCreated(
      generateTestPayload({
        fields: {
          phoneNumber: '+18999999999',
          pageSize: 30,
          page: undefined,
        },
        settings: {
          email: 'user',
          password: 'password',
          apiKey: 'apikey',        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allMessages: '["Received"]',
        numberOfMessages: '1',
        latestMessage: 'Received',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback with zero answers', async () => {
    await getMessages.onActivityCreated(
      generateTestPayload({
        fields: {
          phoneNumber: '+19144542596',
          pageSize: 30,
          page: 1,
        },
        settings: {
          email: 'user',
          password: 'password',
          apiKey: 'apikey',      
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
    await getMessages.onActivityCreated(
      generateTestPayload({
        fields: {
          phoneNumber: undefined,
          pageSize: undefined,
          page: undefined,
        },
        settings: {
          email: 'user',
          password: 'password',
          apiKey: 'apikey',      
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

  test('Should call the onFail when page size is negative', async () => {
    await getMessages.onActivityCreated(
      generateTestPayload({
        fields: {
          phoneNumber: '+19144542596',
          pageSize: -30,
          page: 1,
        },
        settings: {
          email: 'user',
          password: 'password',
          apiKey: 'apikey',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalledWith()
    expect(onError).toHaveBeenCalled()
  })
})
