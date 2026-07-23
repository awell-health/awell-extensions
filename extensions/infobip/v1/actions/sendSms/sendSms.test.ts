import {
  mockedPhoneNumber,
  mockedMessageData,
  InfobipClientMockImplementation,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { sendSms } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Send SMS', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendSms)

  const basePayload = generateTestPayload({
    fields: {
      from: mockedPhoneNumber.from,
      text: mockedMessageData.messages[0].text,
      to: mockedPhoneNumber.to,
    },
    settings: {
      baseUrl: 'https://example.api.com',
      apiKey: 'apiKey',
      fromPhoneNumber: '+19033428784',
      fromEmail: 'john@doe.com',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(InfobipClientMockImplementation.smsApi.send).toHaveBeenCalledWith(
      mockedMessageData,
    )
    expect(onComplete).toHaveBeenCalledWith()
    expect(onError).not.toHaveBeenCalled()
  })
})
