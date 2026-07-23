import { sendSms } from './sendSms'
import { generateTestPayload } from '@/tests'
import { mockReturnValue } from '../../client/__mocks__/textLineApi'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../client/textLineApi', () => jest.fn(() => mockReturnValue))

describe('Send SMS action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendSms)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: '+13108820245',
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
        conversationId: '30cded5d-90b7-4aae-9f51-b6b143376bb2',
        messageId: '7d3d9cbc-c053-4e7c-b837-cb2e38202117',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  }, 20000)

  test('Should call the onError callback when there is no recipient', async () => {
    await sendSms.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: 'Message content',
          recipient: undefined,
          departmentId: 'somedepartment',
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
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no message', async () => {
    await sendSms.onEvent!({
      payload: generateTestPayload({
        fields: {
          message: undefined,
          recipient: '+13108820245',
          departmentId: 'somedepartment',
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
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
