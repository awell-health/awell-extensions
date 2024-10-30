import {
  mockedPhoneNumber,
  mockedMessageData,
  InfobipClientMockImplementation,
} from '../../client/__mocks__'
import { sendSms } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Send SMS', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

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
  })

  test('Should call the onComplete callback', async () => {
    await sendSms.onActivityCreated!(basePayload, onComplete, onError)

    expect(InfobipClientMockImplementation.smsApi.send).toHaveBeenCalledWith(
      mockedMessageData
    )
    expect(onComplete).toHaveBeenCalledWith()
    expect(onError).not.toHaveBeenCalled()
  })
})
