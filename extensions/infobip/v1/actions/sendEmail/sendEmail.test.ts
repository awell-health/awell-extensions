import {
  InfobipClientMockImplementation,
  mockedEmailData,
} from '../../client/__mocks__'
import { sendEmail } from '..'
import { generateTestPayload } from '../../../../../src/tests'

jest.mock('../../client')

describe('Send email', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      from: mockedEmailData.from,
      to: mockedEmailData.to[0],
      subject: mockedEmailData.subject,
      content: mockedEmailData.html,
      replyTo: mockedEmailData.replyTo,
    },
    settings: {
      baseUrl: 'https://example.api.com',
      apiKey: 'apiKey',
      fromPhoneNumber: undefined,
      fromEmail: undefined,
      replyTo: undefined,
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onActivityCreated(basePayload, onComplete, onError)

    expect(InfobipClientMockImplementation.emailApi.send).toHaveBeenCalledWith(
      mockedEmailData
    )
    expect(onComplete).toHaveBeenCalledWith()
    expect(onError).not.toHaveBeenCalled()
  })
})
