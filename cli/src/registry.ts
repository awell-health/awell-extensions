import type { Extension, Action, Webhook } from '@awell-health/extensions-core'

// The CLI is registry-agnostic: the composition root (src/index.ts) injects the
// concrete extension registry via setRegistry() at startup. Keeping the CLI logic
// decoupled from any specific repo means it can later be extracted into its own
// package that receives a registry from whatever consumes it.
let registry: Extension[] = []

export const setRegistry = (extensions: Extension[]): void => {
  registry = extensions
}

export const listExtensions = (): Extension[] => registry

export const findExtension = (key: string): Extension | undefined =>
  registry.find((e) => e.key === key)

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
