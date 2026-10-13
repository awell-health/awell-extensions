import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { deleteFile } from './deleteFile'
import cloudinary from '../../lib/sdk/cloudinarySdk'

jest.mock('../../lib/sdk/cloudinarySdk')

const destroyMock = cloudinary.uploader.destroy as unknown as jest.Mock

const settings = {
  cloudName: 'cloud-name',
  uploadPreset: 'upload-preset',
  folder: undefined,
  apiKey: 'api-key',
  apiSecret: 'api-secret',
}

describe('Cloudinary - Delete file', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(deleteFile)

  beforeEach(() => {
    clearMocks()
    destroyMock.mockClear()
  })

  test('Deletes a private raw asset by public id', async () => {
    await deleteFile.onEvent!({
      payload: generateTestPayload({
        fields: { publicId: 'reports/abc.pdf' },
        settings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(destroyMock).toHaveBeenCalledWith(
      'reports/abc.pdf',
      expect.objectContaining({
        cloud_name: 'cloud-name',
        api_key: 'api-key',
        api_secret: 'api-secret',
        resource_type: 'raw',
        type: 'private',
        invalidate: true,
      }),
    )
    expect(onComplete).toHaveBeenCalled()
  })

  test('Treats "not found" as success', async () => {
    destroyMock.mockResolvedValueOnce({ result: 'not found' })

    await deleteFile.onEvent!({
      payload: generateTestPayload({ fields: { publicId: 'gone.pdf' }, settings }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })

  test('Fails when credentials are missing', async () => {
    await deleteFile.onEvent!({
      payload: generateTestPayload({
        fields: { publicId: 'abc.pdf' },
        settings: { ...settings, apiSecret: undefined },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(destroyMock).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Fails with SERVER_ERROR when Cloudinary returns an unexpected result', async () => {
    destroyMock.mockResolvedValueOnce({ result: 'error' })

    await deleteFile.onEvent!({
      payload: generateTestPayload({ fields: { publicId: 'abc.pdf' }, settings }),
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
            error: expect.objectContaining({ category: 'SERVER_ERROR' }),
          }),
        ],
      }),
    )
  })
})
