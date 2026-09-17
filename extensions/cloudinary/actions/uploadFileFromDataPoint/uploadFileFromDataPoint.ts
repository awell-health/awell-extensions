import { randomUUID } from 'crypto'
import { extname } from 'path'
import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { isNil } from 'lodash'
import { ServerSideSettingsValidationSchema, type settings } from '../../settings'
import cloudinary from '../../lib/sdk/cloudinarySdk'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { DEFAULT_CONTENT_TYPE } from './config/fields'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const uploadFileFromDataPoint: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'uploadFileFromDataPoint',
  title: 'Upload file from data point',
  description:
    'Store a base64-encoded file (e.g. a PDF produced by the "HTML to PDF" action) as a private Cloudinary asset and return a time-limited download link.',
  category: Category.CONTENT_AND_FILES,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    // Never log the file content itself; it can be large and may be sensitive.
    const { fileContent, ...loggableFields } = payload.fields
    helpers.log(
      {
        fields: {
          ...loggableFields,
          fileContentLength: isNil(fileContent) ? 0 : String(fileContent).length,
        },
      },
      'Processing uploadFileFromDataPoint',
    )

    try {
      const {
        fields: { fileContent: base64, filename, contentType, linkExpiryHours, folder },
        settings: { cloudName, apiKey, apiSecret, folder: defaultFolder },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: ServerSideSettingsValidationSchema,
        }),
        payload,
      })

      const credentials = {
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      }

      /**
       * Random public id: the stored object carries no patient or care flow
       * identifier. For raw assets Cloudinary keeps the extension as part of
       * the public id, so we append the filename's extension.
       */
      const extension = extname(filename)
      const publicId = `${randomUUID()}${extension}`
      const resolvedFolder = folder ?? defaultFolder
      const dataUri = `data:${contentType ?? DEFAULT_CONTENT_TYPE};base64,${base64}`

      const uploaded = await cloudinary.uploader.upload(dataUri, {
        ...credentials,
        resource_type: 'raw',
        type: 'private',
        public_id: publicId,
        ...(resolvedFolder !== undefined && { folder: resolvedFolder }),
        overwrite: false,
        unique_filename: false,
        use_filename: false,
      })

      const expiresAtSeconds =
        Math.floor(Date.now() / 1000) + Math.round(linkExpiryHours * 3600)

      const fileUrl = cloudinary.utils.private_download_url(
        uploaded.public_id,
        '',
        {
          ...credentials,
          resource_type: 'raw',
          type: 'private',
          attachment: true,
          expires_at: expiresAtSeconds,
        },
      )

      const linkExpiresAt = new Date(expiresAtSeconds * 1000).toISOString()

      await onComplete({
        data_points: {
          fileUrl,
          publicId: uploaded.public_id,
          linkExpiresAt,
        },
        events: [
          addActivityEventLog({
            message: `Stored "${filename}" as private Cloudinary asset ${uploaded.public_id} (${String(
              uploaded.bytes,
            )} bytes). Download link valid until ${linkExpiresAt}.`,
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
              error: {
                category: 'WRONG_INPUT',
                message: `${error.message}`,
              },
            },
          ],
        })
        return
      }

      const error = err as Error & { error?: { message?: string } }
      const message = error?.error?.message ?? error.message
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Cloudinary upload failed' },
            error: {
              category: 'SERVER_ERROR',
              message,
            },
          },
        ],
      })
    }
  },
}
