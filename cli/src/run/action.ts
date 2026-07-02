import {
  ExtensionAction,
  AwellError,
  type ActivityEvent,
} from '@awell-health/extensions-core'
import { findAction, findExtension } from '../registry'
import { buildPayload } from '../payload'
import { createHelpers } from '../helpers'
import { settingsToValues, resolveSettings } from '../env'
import { printResult, type ActionResult } from '../output'

interface RunOpts {
  extensionKey: string
  actionKey: string
  fields: Record<string, unknown>
  patientId?: string
  pathwayId?: string
  activityId?: string
  json: boolean
}

export const runAction = async (opts: RunOpts): Promise<ActionResult> => {
  const action = findAction(opts.extensionKey, opts.actionKey)
  if (action === undefined) {
    throw new Error(
      `Action ${opts.actionKey} not found in extension ${opts.extensionKey}`,
    )
  }

  const ext = findExtension(opts.extensionKey)
  const extSettings = ext?.settings ?? {}

  // Pre-flight: warn (don't block) when required settings are missing, with an
  // actionable next step — mirrors the `doctor` command's hint style.
  const missingRequired = resolveSettings(
    opts.extensionKey,
    extSettings,
  ).filter((r) => r.setting.required === true && !r.present)
  if (missingRequired.length > 0) {
    process.stderr.write(
      `Warning: ${missingRequired.length} required setting(s) missing: ${missingRequired
        .map((r) => r.envVar)
        .join(', ')}\n` +
        `The handler will likely fail. Check with: awell-ext doctor ${opts.extensionKey}\n` +
        `Fix with: awell-ext setup ${opts.extensionKey}\n\n`,
    )
  }

  const settings = settingsToValues(opts.extensionKey, extSettings)

  const payload = buildPayload({
    fields: opts.fields,
    settings,
    patientId: opts.patientId,
    pathwayId: opts.pathwayId,
    activityId: opts.activityId,
  })

  const runner = new ExtensionAction(action as any)
  const result: ActionResult = {
    status: 'complete',
    data_points: {},
    events: [],
  }

  const onComplete = async (p?: {
    events?: ActivityEvent[]
    data_points?: Record<string, string | null | undefined>
  }): Promise<void> => {
    if (p?.data_points !== undefined)
      Object.assign(result.data_points, p.data_points)
    if (p?.events !== undefined) result.events.push(...p.events)
  }
  const onError = async (p?: { events?: ActivityEvent[] }): Promise<void> => {
    result.status = 'error'
    if (p?.events !== undefined) result.events.push(...p.events)
  }

  try {
    await runner.onEvent({
      payload,
      attempt: 1,
      helpers: createHelpers(),
      onComplete,
      onError,
    })
  } catch (err) {
    result.status = 'uncaught'
    const awellErr = new AwellError({
      error: err as Error,
      action: action.key,
      extension: opts.extensionKey,
    })
    result.uncaughtError = {
      message: awellErr.message,
      category: awellErr.category,
      title: awellErr.title,
    }
    result.events.push({
      text: { en: awellErr.title },
      date: awellErr.date.toISOString(),
      error: { category: awellErr.category, message: awellErr.message },
    })
  }

  printResult(result, { json: opts.json })
  return result
}
