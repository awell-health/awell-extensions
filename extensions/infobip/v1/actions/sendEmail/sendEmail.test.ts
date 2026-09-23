import {
  InfobipClientMockImplementation,
  mockedEmailData,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

/** "%PDF-1.4 hello" as base64 */
const PDF_BASE64 = Buffer.from('%PDF-1.4 hello').toString('base64')

const settings = {
  baseUrl: 'https://example.api.com',
  apiKey: 'apiKey',
  fromPhoneNumber: '+19033428784',
  fromEmail: 'john@doe.com',
}

const baseFields = {
  from: mockedEmailData.from,
  to: mockedEmailData.to[0],
  subject: mockedEmailData.subject,
  content: mockedEmailData.html,
  attachmentContent: undefined,
  attachmentFilename: undefined,
  attachmentContentType: undefined,
}

describe('Send email', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendEmail)

  const basePayload = generateTestPayload({ fields: baseFields, settings })

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

  test('Should not pass an attachment when the attachment fields are empty strings', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({
        fields: { ...baseFields, attachmentContent: '', attachmentFilename: '' },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const sent = InfobipClientMockImplementation.emailApi.send.mock
      .calls[0][0] as Record<string, unknown>
    expect(sent).not.toHaveProperty('attachment')
    expect(onComplete).toHaveBeenCalled()
  })

  test('Should decode the attachment and pass it with filename and default content type', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({
        fields: {
          ...baseFields,
          attachmentContent: PDF_BASE64,
          attachmentFilename: 'Report.pdf',
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()

    const sent = InfobipClientMockImplementation.emailApi.send.mock
      .calls[0][0] as {
      attachment: { filename: string; data: Buffer; contentType: string }
    }
    expect(sent).toMatchObject(mockedEmailData)
    expect(sent.attachment.filename).toBe('Report.pdf')
    expect(sent.attachment.contentType).toBe('application/pdf')
    expect(Buffer.isBuffer(sent.attachment.data)).toBe(true)
    expect(sent.attachment.data.toString('utf-8')).toBe('%PDF-1.4 hello')
  })

  test('Should honour an explicit content type and accept a data URI prefix', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({
        fields: {
          ...baseFields,
          attachmentContent: `data:text/plain;base64,${Buffer.from('hi').toString('base64')}`,
          attachmentFilename: 'note.txt',
          attachmentContentType: 'text/plain',
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    const sent = InfobipClientMockImplementation.emailApi.send.mock
      .calls[0][0] as { attachment: { data: Buffer; contentType: string } }
    expect(sent.attachment.contentType).toBe('text/plain')
    expect(sent.attachment.data.toString('utf-8')).toBe('hi')
  })

  /**
   * Validation errors are re-thrown to the extensions server (existing
   * behaviour of this action), so they surface as a rejected promise.
   */
  test('Should reject when attachment content is provided without a filename', async () => {
    await expect(
      sendEmail.onEvent!({
        payload: generateTestPayload({
          fields: { ...baseFields, attachmentContent: PDF_BASE64 },
          settings,
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      }),
    ).rejects.toThrow(/attachment filename is required/i)

    expect(InfobipClientMockImplementation.emailApi.send).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should reject when attachment content is not valid base64', async () => {
    await expect(
      sendEmail.onEvent!({
        payload: generateTestPayload({
          fields: {
            ...baseFields,
            attachmentContent: 'this is not base64!!',
            attachmentFilename: 'Report.pdf',
          },
          settings,
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      }),
    ).rejects.toThrow(/not valid base64/i)

    expect(InfobipClientMockImplementation.emailApi.send).not.toHaveBeenCalled()
  })
})
