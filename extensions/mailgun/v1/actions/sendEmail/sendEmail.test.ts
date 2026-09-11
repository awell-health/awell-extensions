import { sendEmail } from '..'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import mailgunSdk from '../../../common/sdk/mailgunSdk'

jest.mock('../../../common/sdk/mailgunSdk')

const settings = {
  apiKey: 'an-api-key',
  domain: 'a-domain',
  fromName: 'John Doe',
  fromEmail: 'hello@awellhealth.com',
  region: 'EU',
  testMode: 'yes',
}

const baseFields = {
  to: 'email@hello.com',
  subject: 'A subject',
  body: "<h1>Don't shout!</h1>",
  attachmentContent: undefined,
  attachmentFilename: undefined,
  attachmentContentType: undefined,
}

/** "%PDF-1.4 hello" as base64 */
const PDF_BASE64 = Buffer.from('%PDF-1.4 hello').toString('base64')

/**
 * The SDK mock returns a fresh client per `client()` call; grab the
 * `messages.create` mock from the most recent client to assert on its params.
 */
const getLastCreateCall = (): Record<string, unknown> => {
  const clientMock = mailgunSdk.client as jest.Mock
  const client = clientMock.mock.results[clientMock.mock.results.length - 1]
    .value as { messages: { create: jest.Mock } }
  const createMock = client.messages.create
  return createMock.mock.calls[0][1] as Record<string, unknown>
}

describe('Send email', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(sendEmail)

  beforeEach(() => {
    clearMocks()
    ;(mailgunSdk.client as jest.Mock).mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({ fields: baseFields, settings }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should not pass an attachment when no attachment content is provided', async () => {
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

    expect(onError).not.toHaveBeenCalled()
    expect(getLastCreateCall()).not.toHaveProperty('attachment')
  })

  test('Should attach a decoded file when attachment content and filename are provided', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({
        fields: {
          ...baseFields,
          attachmentContent: PDF_BASE64,
          attachmentFilename: 'Health-Snapshot.pdf',
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

    const params = getLastCreateCall()
    expect(params).toMatchObject({
      to: ['email@hello.com'],
      subject: 'A subject',
      html: "<h1>Don't shout!</h1>",
    })
    const attachment = params.attachment as {
      filename: string
      data: Buffer
      contentType: string
    }
    expect(attachment.filename).toBe('Health-Snapshot.pdf')
    expect(attachment.contentType).toBe('application/pdf')
    expect(Buffer.isBuffer(attachment.data)).toBe(true)
    expect(attachment.data.toString('utf-8')).toBe('%PDF-1.4 hello')
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

    expect(onError).not.toHaveBeenCalled()
    const attachment = getLastCreateCall().attachment as {
      data: Buffer
      contentType: string
    }
    expect(attachment.contentType).toBe('text/plain')
    expect(attachment.data.toString('utf-8')).toBe('hi')
  })

  test('Should call onError when attachment content is provided without a filename', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({
        fields: { ...baseFields, attachmentContent: PDF_BASE64 },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            error: expect.objectContaining({
              category: 'WRONG_INPUT',
              message: expect.stringContaining('attachment filename is required'),
            }),
          }),
        ],
      }),
    )
  })

  test('Should call onError when attachment content is not valid base64', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({
        fields: {
          ...baseFields,
          attachmentContent: 'this is not base64!!',
          attachmentFilename: 'file.pdf',
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        events: [
          expect.objectContaining({
            error: expect.objectContaining({
              category: 'WRONG_INPUT',
              message: expect.stringContaining('not valid base64'),
            }),
          }),
        ],
      }),
    )
  })

  test('Should call the onError callback when there is a validation error', async () => {
    await sendEmail.onEvent!({
      payload: generateTestPayload({
        fields: baseFields,
        settings: {
          ...settings,
          region: 'not-a-valid-region', // Should be "EU" or "US"
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
