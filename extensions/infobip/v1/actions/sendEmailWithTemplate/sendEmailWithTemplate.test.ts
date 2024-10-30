import {
  InfobipClientMockImplementation,
  mockedEmailWithTemplateData,
} from '../../client/__mocks__'
import { sendEmailWithTemplate } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Send email', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      to: mockedEmailWithTemplateData.to[0],
      templateId: mockedEmailWithTemplateData.templateId,
      subject: mockedEmailWithTemplateData.subject,
      placeholders: mockedEmailWithTemplateData.defaultPlaceholders,
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
    await sendEmailWithTemplate.onActivityCreated!(
      basePayload,
      onComplete,
      onError
    )

    expect(InfobipClientMockImplementation.emailApi.send).toHaveBeenCalledWith(
      mockedEmailWithTemplateData
    )
    expect(onComplete).toHaveBeenCalledWith()
    expect(onError).not.toHaveBeenCalled()
  })
})
