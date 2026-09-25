import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

/**
 * The longest delay one Node timer can hold, 2^31 - 1 ms (about 24.8 days).
 * Node fires a longer timer after 1 ms instead, so longer waits are capped.
 */
export const MAX_TIMER_DELAY_MS = 2 ** 31 - 1

/**
 * Resolves after `ms`. The timer is unref'd so a pending wait never keeps a
 * process alive on its own, e.g. the CLI after it has printed its result.
 */
const sleep = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms).unref()
  })
}

export const wait: Action<typeof fields, typeof settings> = {
  key: 'wait',
  category: Category.WORKFLOW,
  title: 'Wait (DEPRECATED)',
  description: 'Wait n number of seconds before completing',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: { seconds },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    // The payload carries no activity creation time, so the wait counts from
    // when this handler runs.
    const delayMs = Math.min(seconds * 1000, MAX_TIMER_DELAY_MS)
    if (delayMs <= 0) {
      await onComplete()
      return
    }

    // Deliberately not awaited. Awaiting held the extension server's worker
    // slot for the whole wait, and 72-hour waits once held every slot. The
    // handler returns now, the job finishes, and the timer completes the
    // activity later. The timer lives only in this process: if it restarts
    // before the timer fires, the activity is never completed.
    //
    // Neither branch may reject: an unhandled rejection crashes the process.
    void sleep(delayMs)
      .then(async () => {
        await onComplete()
      })
      .catch(async (err) => {
        const message = err instanceof Error ? err.message : String(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: `Failed to complete the wait: ${message}` },
              error: { category: 'SERVER_ERROR', message },
            },
          ],
        })
      })
      .catch((err) => {
        console.error('experimental.wait: could not report a failed wait', err)
      })
  },
}
