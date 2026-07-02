import { type ActivityEvent } from '@awell-health/extensions-core'

/**
 * How the agent should react to a failure. Mirrors §7 of SKILL.md:
 * only transient (SERVER_ERROR) failures are worth retrying unchanged.
 */
export type ErrorClass = 'transient' | 'validation' | 'business' | 'config'

/** Machine-readable failure summary so the agent can decide retry vs fix vs escalate. */
export interface ErrorSummary {
  /** Raw framework category (`ActivityEvent.error.category` / `AwellError.category`). */
  category: string
  errorClass: ErrorClass
  isRetryable: boolean
  /** A concrete recovery action, not a restatement of the error. */
  fix: string
  message: string
}

export interface ActionResult {
  status: 'complete' | 'error' | 'uncaught'
  data_points: Record<string, string | null | undefined>
  events: ActivityEvent[]
  response?: { statusCode: number; message?: string }
  patient_id?: string
  patient_identifier?: { system: string; value: string }
  uncaughtError?: { message: string; category: string; title: string }
  /** Populated by `printResult` when `status !== 'complete'`. */
  error?: ErrorSummary
}

/**
 * Map a framework error category to a recovery classification. Aligned with the
 * four-way taxonomy in SKILL.md §7: only SERVER_ERROR is retryable.
 */
export const classifyErrorCategory = (
  category: string,
): { errorClass: ErrorClass; isRetryable: boolean; fix: string } => {
  switch (category) {
    case 'SERVER_ERROR':
      return {
        errorClass: 'transient',
        isRetryable: true,
        fix: 'Transient/vendor failure (5xx, network, timeout). Safe to retry unchanged; if it persists the vendor may be down.',
      }
    case 'WRONG_INPUT':
    case 'WRONG_DATA':
      return {
        errorClass: 'validation',
        isRetryable: false,
        fix: 'A field value failed validation. Correct the --fields values to satisfy the action schema; retrying unchanged will not help.',
      }
    case 'MISSING_FIELDS':
      return {
        errorClass: 'validation',
        isRetryable: false,
        fix: 'A required field is absent. Add it to --fields; retrying unchanged will not help.',
      }
    case 'MISSING_SETTINGS':
      return {
        errorClass: 'config',
        isRetryable: false,
        fix: 'Required settings are not configured. Run `awell-ext doctor <ext>` then `awell-ext setup <ext>`, then re-run.',
      }
    case 'BAD_REQUEST':
      return {
        errorClass: 'business',
        isRetryable: false,
        fix: 'The vendor rejected the request on business grounds (4xx / duplicate / auth). Do not retry unchanged; inspect the message and adjust inputs or state.',
      }
    default:
      return {
        errorClass: 'business',
        isRetryable: false,
        fix: 'Unclassified error. Inspect the message; do not blindly retry.',
      }
  }
}

/**
 * Derive a single structured failure summary from a result, preferring an
 * `onError` event's category, falling back to an uncaught error.
 */
export const deriveErrorSummary = (
  result: ActionResult,
): ErrorSummary | undefined => {
  if (result.status === 'complete') return undefined
  const eventErr = result.events.find((e) => e.error !== undefined)?.error
  const category =
    eventErr?.category ?? result.uncaughtError?.category ?? 'BAD_REQUEST'
  const message =
    eventErr?.message ?? result.uncaughtError?.message ?? 'Unknown error'
  return { category, message, ...classifyErrorCategory(category) }
}

export const printResult = (
  result: ActionResult,
  opts: { json: boolean },
): void => {
  // Attach the structured failure summary so both JSON and text consumers (and
  // the returned object) carry the retry/fix signal.
  if (result.error === undefined) {
    result.error = deriveErrorSummary(result)
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
    return
  }

  const lines: string[] = []
  lines.push(`status: ${result.status}`)
  if (result.response !== undefined) {
    lines.push(
      `response: ${result.response.statusCode}${result.response.message !== undefined ? ` ${result.response.message}` : ''}`,
    )
  }
  if (result.patient_id !== undefined)
    lines.push(`patient_id: ${result.patient_id}`)
  if (result.patient_identifier !== undefined) {
    lines.push(
      `patient_identifier: ${result.patient_identifier.system} | ${result.patient_identifier.value}`,
    )
  }
  if (Object.keys(result.data_points).length > 0) {
    lines.push('data_points:')
    for (const [k, v] of Object.entries(result.data_points)) {
      lines.push(
        `  ${k}: ${v === undefined ? '<undefined>' : v === null ? '<null>' : v}`,
      )
    }
  }
  if (result.events.length > 0) {
    lines.push('events:')
    for (const e of result.events) {
      const text = e.text.en ?? JSON.stringify(e.text)
      const err =
        e.error !== undefined
          ? ` [${e.error.category}: ${e.error.message}]`
          : ''
      lines.push(`  - ${text}${err}`)
    }
  }
  if (result.uncaughtError !== undefined) {
    lines.push(
      `uncaught: ${result.uncaughtError.title} [${result.uncaughtError.category}]: ${result.uncaughtError.message}`,
    )
  }
  if (result.error !== undefined) {
    const e = result.error
    lines.push('')
    lines.push(
      `error: ${e.category} (${e.errorClass}) — retryable: ${e.isRetryable ? 'yes' : 'no'}`,
    )
    lines.push(`  → ${e.fix}`)
  }
  process.stdout.write(lines.join('\n') + '\n')
}
