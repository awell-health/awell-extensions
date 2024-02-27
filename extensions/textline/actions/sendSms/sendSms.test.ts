import { sendSms } from './sendSms'
import { generateTestPayload } from '../../../../src/tests'
import { mockReturnValue } from '../../client/__mocks__/textLineApi'

jest.mock('../../textLineApi', () => jest.fn(() => mockReturnValue))

describe('Send SMS action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onActivityCreated(
      generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+13108820245',
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
        conversationId: '30cded5d-90b7-4aae-9f51-b6b143376bb2',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 20000)

  test('Should call the onError callback when there is no recipient', async () => {
    await sendSms.onActivityCreated(
      generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: undefined,
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
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no message', async () => {
    await sendSms.onActivityCreated(
      generateTestPayload({
        fields: {
          message: undefined,
          recipient: '+13108820245',
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
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
