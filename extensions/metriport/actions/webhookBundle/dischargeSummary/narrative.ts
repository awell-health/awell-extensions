import { type Attachment, type DiagnosticReport } from '@medplum/fhirtypes'

const DROPPED_ELEMENTS = /<(script|style|head)\b[\s\S]*?<\/\1\s*>/gi
const LINE_BREAK = /<br\s*\/?>/gi
const CELL_END = /<\/(td|th)\s*>/gi
const BLOCK_END =
  /<\/(p|div|li|tr|h[1-6]|table|ul|ol|section|article|header|footer|blockquote|pre|dt|dd)\s*>/gi
const TAG = /<[^>]+>/g
const ENTITY = /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

const decodeEntity = (match: string, entity: string): string => {
  if (entity.startsWith('#')) {
    const hex = entity[1] === 'x' || entity[1] === 'X'
    const code = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10)
    return Number.isFinite(code) && code > 0 && code <= 0x10ffff
      ? String.fromCodePoint(code)
      : match
  }
  return NAMED_ENTITIES[entity.toLowerCase()] ?? match
}

/**
 * Normalises whitespace the way a reader would expect of a note: one space
 * inside a line, lines trimmed, at most one blank line between paragraphs.
 */
export const collapseWhitespace = (text: string): string =>
  text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t\u00a0\f\v]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/**
 * Plain text of an HTML note. Deliberately not a full HTML parser: the notes
 * are EHR-rendered fragments (paragraphs, breaks, tables, the odd entity), and
 * the goal is readable text for a data point, not fidelity. Block ends become
 * line breaks, table cells become spaces, everything else is dropped.
 */
export const htmlToText = (html: string): string =>
  collapseWhitespace(
    html
      .replace(DROPPED_ELEMENTS, '')
      .replace(LINE_BREAK, '\n')
      .replace(CELL_END, ' ')
      .replace(BLOCK_END, '\n')
      .replace(TAG, '')
      .replace(ENTITY, decodeEntity),
  )

const isText = (contentType: string | undefined): boolean =>
  contentType === undefined || /^text\//i.test(contentType)

const isHtml = (contentType: string | undefined): boolean =>
  contentType !== undefined && /html/i.test(contentType)

/**
 * The text of an inline attachment. Only `text/*` is readable: a PDF or an
 * image decoded as text is noise, so it yields nothing, and the field stays
 * empty for the care team to go and look at the document instead.
 */
export const attachmentText = (attachment: Attachment): string | undefined => {
  if (attachment.data === undefined || !isText(attachment.contentType)) {
    return undefined
  }

  const decoded = Buffer.from(attachment.data, 'base64').toString('utf8')
  const text = isHtml(attachment.contentType)
    ? htmlToText(decoded)
    : collapseWhitespace(decoded)

  return text.length > 0 ? text : undefined
}

/**
 * The note a DiagnosticReport carries. Metriport's conversion puts it in
 * `presentedForm` as base64 `text/html` or `text/plain`, with no `conclusion`
 * and no `text.div`; those are checked afterwards only so a differently shaped
 * source still yields something.
 */
export const diagnosticReportText = (
  report: DiagnosticReport,
): string | undefined => {
  for (const form of report.presentedForm ?? []) {
    const text = attachmentText(form)
    if (text !== undefined) return text
  }

  if (report.conclusion !== undefined) {
    const text = collapseWhitespace(report.conclusion)
    if (text.length > 0) return text
  }

  if (report.text?.div !== undefined) {
    const text = htmlToText(report.text.div)
    if (text.length > 0) return text
  }

  return undefined
}
