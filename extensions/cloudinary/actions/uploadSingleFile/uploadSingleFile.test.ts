import { generateTestPayload } from '@/tests'
import { uploadSingleFile } from './uploadSingleFile'

describe('Cloudinary - Upload single file', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await uploadSingleFile.onActivityCreated!(
      generateTestPayload({
        fields: {
          uploadPreset: undefined, // If not defined, it will use preset from the extension settings
          folder: undefined, // If not defined, it will use folder from the extension settings
          tags: 'tag-1, tag-2, tag-3',
        },
        settings: {
          cloudName: 'cloud-name',
          uploadPreset: 'upload-preset',
          folder: 'variant-label',
        },
      }),
      onComplete,
      jest.fn()
    )

    /**
     * Because completion is done in Awell Hosted Pages
     */
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
