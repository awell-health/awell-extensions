import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { ServerSideSettingsValidationSchema, type settings } from '../../settings'
import cloudinary from '../../lib/sdk/cloudinarySdk'
import { fields, FieldsValidationSchema } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const deleteFile: Action<typeof fields, typeof settings> = {
  key: 'deleteFile',
  title: 'Delete file',
  description:
    'Permanently delete a private raw asset previously stored with "Upload file from data point".',
  category: Category.CONTENT_AND_FILES,
  fields,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    helpers.log({ fields: payload.fields }, 'Processing deleteFile')

    try {
      const {
        fields: { publicId },
        settings: { cloudName, apiKey, apiSecret },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: ServerSideSettingsValidationSchema,
        }),
        payload,
      })

      /**
       * The SDK's type for destroy options omits credentials, but at runtime
       * they are read from the options object (see utils.sign_request /
       * utils.api_url), which is how we keep credentials per call.
       */
      const destroyOptions: Record<string, string | boolean> & {
        resource_type: 'raw'
        type: 'private'
        invalidate: boolean
      } = {
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        resource_type: 'raw',
        type: 'private',
        invalidate: true,
      }

      const res = (await cloudinary.uploader.destroy(
        publicId,
        destroyOptions,
      )) as { result?: string }

      // Cloudinary answers "ok" when deleted and "not found" when already gone.
      if (res?.result !== 'ok' && res?.result !== 'not found') {
        throw new Error(
          `Cloudinary did not confirm deletion of ${publicId}: ${JSON.stringify(res)}`,
        )
      }

      await onComplete({
        events: [
          addActivityEventLog({
            message:
              res.result === 'ok'
                ? `Deleted Cloudinary asset ${publicId}.`
                : `Cloudinary asset ${publicId} was already deleted.`,
          }),
        ],
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: { category: 'WRONG_INPUT', message: `${error.message}` },
            },
          ],
        })
        return
      }

      const error = err as Error & { error?: { message?: string } }
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Cloudinary delete failed' },
            error: {
              category: 'SERVER_ERROR',
              message: error?.error?.message ?? error.message,
            },
          },
        ],
      })
    }
  },
}
