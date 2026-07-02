import { extensions } from '../../extensions'
import type { Extension, Action, Webhook } from '@awell-health/extensions-core'

export const listExtensions = (): Extension[] => extensions

export const findExtension = (key: string): Extension | undefined =>
  extensions.find((e) => e.key === key)

export const findAction = (
  extensionKey: string,
  actionKey: string,
): Action<any, any, any> | undefined => {
  const ext = findExtension(extensionKey)
  if (ext === undefined) return undefined
  return Object.values(ext.actions).find((a) => a.key === actionKey)
}

export const findWebhook = (
  extensionKey: string,
  webhookKey: string,
): Webhook<any, any, any> | undefined => {
  const ext = findExtension(extensionKey)
  if (ext === undefined || ext.webhooks === undefined) return undefined
  return ext.webhooks.find((w) => w.key === webhookKey)
}

export type { Extension, Action, Webhook }
