/**
 * Public entry point for @awell-health/extension-cli.
 *
 * Consumers wire the CLI to their own extension registry:
 *
 *   #!/usr/bin/env ts-node
 *   import { runCli } from '@awell-health/extension-cli'
 *   import MyExtension from './src'
 *
 *   runCli([MyExtension])
 */
export { runCli } from './cli'
export {
  setRegistry,
  listExtensions,
  findExtension,
  findAction,
  findWebhook,
} from './registry'
export type { Extension, Action, Webhook } from './registry'
export type { ActionResult } from './output'
