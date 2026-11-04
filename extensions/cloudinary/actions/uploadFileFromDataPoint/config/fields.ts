import { z, type ZodType } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  fileContent: {
    id: 'fileContent',
    label: 'File content (base64)',
    description:
      'Base64-encoded content of the file, for example the "base64Pdf" data point produced by the Transform "HTML to PDF" action.',
    type: FieldType.STRING,
    required: true,
  },
  filename: {
    id: 'filename',
    label: 'Filename',
    description:
      'Filename including extension, e.g. "Health-Snapshot.pdf". Shown to the person downloading the file. Do not include personal information in the filename.',
    type: FieldType.STRING,
    required: true,
  },
  contentType: {
    id: 'contentType',
    label: 'Content type',
    description: 'MIME type of the file. Defaults to "application/pdf".',
    type: FieldType.STRING,
    required: false,
  },
  linkExpiryHours: {
    id: 'linkExpiryHours',
    label: 'Download link expiry (hours)',
    description:
      'How long the returned download link stays valid, between 1 and 168 hours (7 days). Defaults to 24. The stored file itself is not deleted when the link expires; use the "Delete file" action for that.',
    type: FieldType.NUMERIC,
    required: false,
  },
  folder: {
    id: 'folder',
    label: 'Folder',
    description:
      'Upload the file to the specified folder. If left empty, the folder defined in the extension settings will be used.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

/**
 * Cloudinary's per-file limit for raw assets is 10 MB on free plans (larger on
 * paid plans). Cap here so the failure is a clear validation error.
 */
export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const DEFAULT_CONTENT_TYPE = 'application/pdf'
export const DEFAULT_LINK_EXPIRY_HOURS = 24
export const MIN_LINK_EXPIRY_HOURS = 1
export const MAX_LINK_EXPIRY_HOURS = 24 * 7

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/

/** Accepts raw base64 or a data URI and returns bare base64 without whitespace. */
export const normalizeBase64 = (value: string): string =>
  value.replace(/^data:[^;,]*;base64,/i, '').replace(/\s+/g, '')

export const isValidBase64 = (value: string): boolean =>
  value.length > 0 && value.length % 4 === 0 && BASE64_PATTERN.test(value)

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (isNil(value) || isEmpty(value) ? undefined : value))

export const FieldsValidationSchema = z
  .object({
    fileContent: z
      .string()
      .trim()
      .min(1, { error: 'File content is required.' })
      .transform(normalizeBase64)
      .refine(isValidBase64, {
        error:
          'File content is not valid base64. Expected the raw base64 string, e.g. the "base64Pdf" data point from the HTML to PDF action.',
      })
      .refine((b64) => Buffer.from(b64, 'base64').length <= MAX_FILE_BYTES, {
        error: `File exceeds the maximum size of ${MAX_FILE_BYTES} bytes.`,
      }),
    filename: z
      .string()
      .trim()
      .min(1, { error: 'Filename is required.' })
      .refine((name) => !/[/\\]/.test(name), {
        error: 'Filename must not contain path separators.',
      }),
    contentType: optionalTrimmedString,
    linkExpiryHours: z
      .union([z.number(), z.string()])
      .optional()
      .transform((value) => {
        if (isNil(value) || (typeof value === 'string' && isEmpty(value.trim())))
          return DEFAULT_LINK_EXPIRY_HOURS
        return Number(value)
      })
      .refine(
        (hours) =>
          Number.isFinite(hours) &&
          hours >= MIN_LINK_EXPIRY_HOURS &&
          hours <= MAX_LINK_EXPIRY_HOURS,
        {
          error: `Download link expiry must be between ${MIN_LINK_EXPIRY_HOURS} and ${MAX_LINK_EXPIRY_HOURS} hours.`,
        },
      ),
    folder: optionalTrimmedString,
  } satisfies Record<keyof typeof fields, ZodType>)

export type ValidatedFields = z.infer<typeof FieldsValidationSchema>
