import {
  InfobipClientMockImplementation,
  mockedEmailData,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Send email', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendEmail)

  const basePayload = generateTestPayload({
    fields: {
      from: mockedEmailData.from,
      to: mockedEmailData.to[0],
      subject: mockedEmailData.subject,
      content: mockedEmailData.html,
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
    await sendEmail.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(InfobipClientMockImplementation.emailApi.send).toHaveBeenCalledWith(
      mockedEmailData,
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
