import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { uploadFileFromDataPoint } from './uploadFileFromDataPoint'
import cloudinary from '../../lib/sdk/cloudinarySdk'

jest.mock('../../lib/sdk/cloudinarySdk')

const uploadMock = cloudinary.uploader.upload as unknown as jest.Mock
const downloadUrlMock = cloudinary.utils.private_download_url as unknown as jest.Mock

const settings = {
  cloudName: 'cloud-name',
  uploadPreset: 'upload-preset',
  folder: 'reports',
  apiKey: 'api-key',
  apiSecret: 'api-secret',
}

const PDF_BASE64 = Buffer.from('%PDF-1.4 hello').toString('base64')

const baseFields = {
  fileContent: PDF_BASE64,
  filename: 'Health-Snapshot.pdf',
  contentType: undefined,
  linkExpiryHours: undefined,
  folder: undefined,
}

const expectWrongInput = (onError: jest.Mock, fragment: string): void => {
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({
            category: 'WRONG_INPUT',
            message: expect.stringContaining(fragment),
          }),
        }),
      ],
    }),
  )
}

describe('Cloudinary - Upload file from data point', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    uploadFileFromDataPoint,
  )

  beforeEach(() => {
    clearMocks()
    uploadMock.mockClear()
    downloadUrlMock.mockClear()
    jest.useFakeTimers().setSystemTime(new Date('2026-09-17T12:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('Uploads a private raw asset with a random id and returns a signed link', async () => {
    await uploadFileFromDataPoint.onEvent!({
      payload: generateTestPayload({ fields: baseFields, settings }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(uploadMock).toHaveBeenCalledTimes(1)

    const [dataUri, options] = uploadMock.mock.calls[0] as [string, Record<string, unknown>]
    expect(dataUri).toBe(`data:application/pdf;base64,${PDF_BASE64}`)
    expect(options).toMatchObject({
      cloud_name: 'cloud-name',
      api_key: 'api-key',
      api_secret: 'api-secret',
      resource_type: 'raw',
      type: 'private',
      folder: 'reports',
      overwrite: false,
      use_filename: false,
    })
    // random uuid + original extension; never the patient-facing filename
    expect(options.public_id).toMatch(/^[0-9a-f-]{36}\.pdf$/)
    expect(options).not.toHaveProperty('tags')

    const [publicId, format, urlOptions] = downloadUrlMock.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ]
    expect(publicId).toBe(options.public_id)
    expect(format).toBe('')
    expect(urlOptions).toMatchObject({
      resource_type: 'raw',
      type: 'private',
      attachment: true,
      api_secret: 'api-secret',
    })
    // default expiry 24h from the frozen clock
    const expected = Math.floor(new Date('2026-09-18T12:00:00.000Z').getTime() / 1000)
    expect(urlOptions.expires_at).toBe(expected)

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: {
          fileUrl: expect.stringContaining('/raw/download?public_id='),
          publicId: options.public_id,
          linkExpiresAt: '2026-09-18T12:00:00.000Z',
        },
      }),
    )
  })

  test('Honours content type, expiry, folder override and a data URI prefix', async () => {
    await uploadFileFromDataPoint.onEvent!({
      payload: generateTestPayload({
        fields: {
          ...baseFields,
          fileContent: `data:text/plain;base64,${Buffer.from('hi').toString('base64')}`,
          filename: 'note.txt',
          contentType: 'text/plain',
          linkExpiryHours: 2,
          folder: 'other',
        },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    const [dataUri, options] = uploadMock.mock.calls[0] as [string, Record<string, unknown>]
    expect(dataUri).toBe(`data:text/plain;base64,${Buffer.from('hi').toString('base64')}`)
    expect(options.folder).toBe('other')
    expect(options.public_id).toMatch(/\.txt$/)
    const urlOptions = downloadUrlMock.mock.calls[0][2] as Record<string, unknown>
    expect(urlOptions.expires_at).toBe(
      Math.floor(new Date('2026-09-17T14:00:00.000Z').getTime() / 1000),
    )
  })

  test('Fails with WRONG_INPUT when API credentials are missing from settings', async () => {
    await uploadFileFromDataPoint.onEvent!({
      payload: generateTestPayload({
        fields: baseFields,
        settings: { ...settings, apiKey: undefined, apiSecret: undefined },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(uploadMock).not.toHaveBeenCalled()
    expectWrongInput(onError as jest.Mock, 'API key')
  })

  test('Fails with WRONG_INPUT when content is not valid base64', async () => {
    await uploadFileFromDataPoint.onEvent!({
      payload: generateTestPayload({
        fields: { ...baseFields, fileContent: 'this is not base64!!' },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(uploadMock).not.toHaveBeenCalled()
    expectWrongInput(onError as jest.Mock, 'not valid base64')
  })

  test('Fails with WRONG_INPUT when expiry is out of range', async () => {
    await uploadFileFromDataPoint.onEvent!({
      payload: generateTestPayload({
        fields: { ...baseFields, linkExpiryHours: 500 },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expectWrongInput(onError as jest.Mock, 'between 1 and 168')
  })

  test('Fails with SERVER_ERROR when Cloudinary rejects the upload', async () => {
    uploadMock.mockRejectedValueOnce({ error: { message: 'Invalid Signature' } })

    await uploadFileFromDataPoint.onEvent!({
      payload: generateTestPayload({ fields: baseFields, settings }),
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
              category: 'SERVER_ERROR',
              message: 'Invalid Signature',
            }),
          }),
        ],
      }),
    )
  })
})
