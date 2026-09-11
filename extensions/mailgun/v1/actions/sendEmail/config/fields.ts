import { z, type ZodType } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { CommaSeparatedEmailsValidationSchema } from '../../../../../../src/lib/awell'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  to: {
    id: 'to',
    label: 'To',
    description: 'The email address of the recipient.',
    type: FieldType.STRING,
    /**
     * I am purposely not using the `email` stringType yet.
     * More information here: https://awellhealth.atlassian.net/jira/polaris/projects/AH/ideas/view/548618?selectedIssue=AH-176&issueViewLayout=sidebar&issueViewSection=capture&focusedInsightId=3144292
     */
    // stringType: StringType.EMAIL,
    required: true,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'The subject of your email.',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Body',
    description: 'The content of your message.',
    type: FieldType.HTML,
    required: true,
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
      'The filename the recipient will see, including the extension (e.g. "Health-Snapshot.pdf"). Required when attachment content is provided.',
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
 * Mailgun rejects messages above 25 MB in total. Cap the decoded attachment
 * well below that so the failure surfaces as a clear validation error rather
 * than an opaque API error.
 */
export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024
export const DEFAULT_ATTACHMENT_CONTENT_TYPE = 'application/pdf'

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/

/**
 * Accepts raw base64 as well as a data URI ("data:application/pdf;base64,....")
 * and returns the bare base64 payload with all whitespace removed.
 */
export const normalizeBase64 = (value: string): string => {
  const withoutDataUriPrefix = value.replace(/^data:[^;,]*;base64,/i, '')
  return withoutDataUriPrefix.replace(/\s+/g, '')
}

export const isValidBase64 = (value: string): boolean =>
  value.length > 0 && value.length % 4 === 0 && BASE64_PATTERN.test(value)

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (isNil(value) || isEmpty(value) ? undefined : value))

export const FieldsValidationSchema = z
  .object({
    to: CommaSeparatedEmailsValidationSchema.refine(
      (emails) => emails.length > 0,
      {
        error: 'At least one email address is required',
      },
    ),
    subject: z.string(),
    body: z.string(),
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
        message: `Attachment is ${decodedBytes} bytes, which exceeds the maximum of ${MAX_ATTACHMENT_BYTES} bytes.`,
      })
    }
  })

export const validateActionFields = (
  fields: unknown,
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}

export interface MailgunAttachment {
  filename: string
  data: Buffer
  contentType: string
}

/**
 * Builds the attachment object expected by mailgun.js `messages.create`
 * (`{ filename, data, contentType }`), or `undefined` when no attachment
 * content was provided. Assumes the fields have already been validated.
 */
export const buildAttachment = (
  fields: z.infer<typeof FieldsValidationSchema>,
): MailgunAttachment | undefined => {
  if (isNil(fields.attachmentContent) || isNil(fields.attachmentFilename)) {
    return undefined
  }

  return {
    filename: fields.attachmentFilename,
    data: Buffer.from(normalizeBase64(fields.attachmentContent), 'base64'),
    contentType: fields.attachmentContentType ?? DEFAULT_ATTACHMENT_CONTENT_TYPE,
  }
}
