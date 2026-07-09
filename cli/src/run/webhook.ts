import {
  ExtensionWebhook,
  AwellError,
  type ActivityEvent,
} from '@awell-health/extensions-core'
import { findWebhook, findExtension } from '../registry'
import { createHelpers } from '../helpers'
import { settingsToValues } from '../env'
import { printResult, type ActionResult } from '../output'
import type { IncomingHttpHeaders } from 'http'

interface ReplayOpts {
  extensionKey: string
  webhookKey: string
  payload: unknown
  headers?: IncomingHttpHeaders
  json: boolean
}

export const replayWebhook = async (
  opts: ReplayOpts,
): Promise<ActionResult> => {
  const webhook = findWebhook(opts.extensionKey, opts.webhookKey)
  if (webhook === undefined) {
    throw new Error(
      `Webhook ${opts.webhookKey} not found in extension ${opts.extensionKey}`,
    )
  }
  const ext = findExtension(opts.extensionKey)
  const settings = settingsToValues(opts.extensionKey, ext?.settings ?? {})

  const rawBody = Buffer.from(JSON.stringify(opts.payload))
  const runner = new ExtensionWebhook(webhook as any)
  const result: ActionResult = {
    status: 'complete',
    data_points: {},
    events: [],
  }

  const onSuccess = async (p?: {
    events?: ActivityEvent[]
    data_points?: Record<string, string | null | undefined>
    response?: { statusCode: number; message?: string }
    patient_id?: string
    patient_identifier?: { system: string; value: string }
  }): Promise<void> => {
    if (p?.data_points !== undefined)
      Object.assign(result.data_points, p.data_points)
    if (p?.events !== undefined) result.events.push(...p.events)
    if (p?.response !== undefined) result.response = p.response
    if (p?.patient_id !== undefined) result.patient_id = p.patient_id
    if (p?.patient_identifier !== undefined)
      result.patient_identifier = p.patient_identifier
  }
  const onError = async (p?: {
    events?: ActivityEvent[]
    response?: { statusCode: number; message?: string }
  }): Promise<void> => {
    result.status = 'error'
    if (p?.events !== undefined) result.events.push(...p.events)
    if (p?.response !== undefined) result.response = p.response
  }

  try {
    await runner.onEvent({
      payload: {
        payload: opts.payload,
        rawBody,
        headers: opts.headers ?? { 'content-type': 'application/json' },
        settings,
      },
      onSuccess,
      onError,
      helpers: createHelpers(),
    })
  } catch (err) {
    result.status = 'uncaught'
    const awellErr = new AwellError({
      error: err as Error,
      action: webhook.key,
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
