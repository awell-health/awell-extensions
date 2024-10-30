import {
  mockedSendEmailData,
  IterableClientMockImplementation,
} from '../../client/__mocks__'
import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Iterable - Send email', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      campaignId: mockedSendEmailData.campaignId,
      recipientEmail: mockedSendEmailData.recipientEmail,
      recipientUserId: mockedSendEmailData.recipientUserId,
      allowRepeatMarketingSends: mockedSendEmailData.allowRepeatMarketingSends,
      dataFields: JSON.stringify(mockedSendEmailData.dataFields),
      metadata: JSON.stringify(mockedSendEmailData.metadata),
    },
    settings: {
      apiKey: 'apiKey',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onActivityCreated!(basePayload, onComplete, onError)

    expect(
      IterableClientMockImplementation.emailApi.sendEmail
    ).toHaveBeenCalledWith({
      ...mockedSendEmailData,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
