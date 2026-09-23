import { z, type ZodType } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { type EmailAttachment } from '../../../types'

export const fields = {
  from: {
    label: 'From',
    id: 'from',
    type: FieldType.STRING,
    required: false,
    description:
      'The email address you wish to use for sending emails. Defaults to value provided in settings.',
  },
  to: {
    label: 'To',
    id: 'to',
    type: FieldType.STRING,
    required: true,
    description: 'The email address to which you intend to send the email',
  },
  subject: {
    label: 'Subject',
    id: 'subject',
    type: FieldType.STRING,
    required: true,
    description: '',
  },
  content: {
    label: 'Content',
    id: 'content',
    type: FieldType.HTML,
    required: true,
    description: '',
  },
  attachmentContent: {
    id: 'attachmentContent',
    label: 'Attachment content (base64)',
    description:
      'Base64-encoded content of a file to attach, for example the "base64Pdf" data point produced by the Transform "HTML to PDF" action. Leave empty to send the email without an attachment.',
    type: FieldType.STRING,
    required: false,
  },
  attachmentFilename: {
    id: 'attachmentFilename',
    label: 'Attachment filename',
    description:
      'The filename the recipient will see, including the extension (e.g. "Report.pdf"). Required when attachment content is provided.',
    type: FieldType.STRING,
    required: false,
  },
  attachmentContentType: {
    id: 'attachmentContentType',
    label: 'Attachment content type',
    description:
      'MIME type of the attachment. Defaults to "application/pdf" when left empty.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

/**
 * Infobip rejects emails above 10 MB in total (body + attachments). Cap the
 * decoded attachment below that so the failure is a clear validation error.
 */
export const MAX_ATTACHMENT_BYTES = 9 * 1024 * 1024
export const DEFAULT_ATTACHMENT_CONTENT_TYPE = 'application/pdf'

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
    from: makeStringOptional(z.string()),
    to: z.email(),
    subject: z.string(),
    content: z.string(),
    attachmentContent: optionalTrimmedString,
    attachmentFilename: optionalTrimmedString,
    attachmentContentType: optionalTrimmedString,
  } satisfies Record<keyof typeof fields, ZodType>)
  .superRefine((value, ctx) => {
    if (isNil(value.attachmentContent)) {
      return
    }

    if (isNil(value.attachmentFilename)) {
      ctx.addIssue({
        code: 'custom',
        path: ['attachmentFilename'],
        message:
          'An attachment filename is required when attachment content is provided.',
      })
    }

    const base64 = normalizeBase64(value.attachmentContent)

    if (!isValidBase64(base64)) {
      ctx.addIssue({
        code: 'custom',
        path: ['attachmentContent'],
        message:
          'Attachment content is not valid base64. Expected the raw base64 string, e.g. the "base64Pdf" data point from the HTML to PDF action.',
      })
      return
    }

    const decodedBytes = Buffer.from(base64, 'base64').length

    if (decodedBytes > MAX_ATTACHMENT_BYTES) {
      ctx.addIssue({
        code: 'custom',
        path: ['attachmentContent'],
        message: `Attachment is ${decodedBytes} bytes, which exceeds the maximum of ${MAX_ATTACHMENT_BYTES} bytes (Infobip limits emails to 10 MB in total).`,
      })
    }
  })

/**
 * Builds the attachment expected by the Infobip client, or `undefined` when no
 * attachment content was provided. Assumes the fields have already been validated.
 */
export const buildAttachment = (
  fields: z.infer<typeof FieldsValidationSchema>,
): EmailAttachment | undefined => {
  if (isNil(fields.attachmentContent) || isNil(fields.attachmentFilename)) {
    return undefined
  }

  return {
    filename: fields.attachmentFilename,
    data: Buffer.from(normalizeBase64(fields.attachmentContent), 'base64'),
    contentType:
      fields.attachmentContentType ?? DEFAULT_ATTACHMENT_CONTENT_TYPE,
  }
}
