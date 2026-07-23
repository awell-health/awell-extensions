import {
  mockedSendEmailData,
  IterableClientMockImplementation,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Iterable - Send email', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendEmail)

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
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      IterableClientMockImplementation.emailApi.sendEmail,
    ).toHaveBeenCalledWith({
      ...mockedSendEmailData,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
