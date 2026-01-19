#!/usr/bin/env ts-node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const EXTENSIONS_DIR = path.join(__dirname, '..', 'extensions')

interface ExtensionSetting {
  key: string
  label: string
  obfuscated: boolean
  description: string
}

interface ExtensionConfig {
  name: string
  key: string
  description: string
  settings: ExtensionSetting[]
  includeHelloWorldAction: boolean
  includeHelloWorldWebhook: boolean
}

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (chr) => chr.toUpperCase())
}

function createReadline(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

async function question(
  rl: readline.Interface,
  query: string,
): Promise<string> {
  return await new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function confirm(
  rl: readline.Interface,
  query: string,
): Promise<boolean> {
  const answer = await question(rl, `${query} (y/n): `)
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
}

async function gatherSettings(
  rl: readline.Interface,
): Promise<ExtensionSetting[]> {
  const settings: ExtensionSetting[] = []

  const addSettings = await confirm(
    rl,
    'Would you like to add extension settings?',
  )
  if (!addSettings) return settings

  let addMore = true
  while (addMore) {
    console.log('\n--- Adding new setting ---')
    const key = await question(rl, 'Setting key (camelCase): ')
    if (key.length === 0) {
      console.log('Setting key is required. Skipping...')
      addMore = await confirm(rl, 'Add another setting?')
      continue
    }

    const labelInput = await question(rl, `Setting label [${key}]: `)
    const label = labelInput.length > 0 ? labelInput : key
    const descriptionInput = await question(rl, 'Setting description: ')
    const description = descriptionInput.length > 0 ? descriptionInput : ''
    const obfuscated = await confirm(rl, 'Is this a secret/obfuscated value?')

    settings.push({ key, label, obfuscated, description })
    console.log(`✓ Added setting: ${key}`)

    addMore = await confirm(rl, 'Add another setting?')
  }

  return settings
}

async function gatherConfig(): Promise<ExtensionConfig> {
  const rl = createReadline()

  try {
    console.log('\n🚀 Extension Generator\n')
    console.log('This script will help you create a new Awell extension.\n')

    // Extension name
    const name = await question(rl, 'Extension name (e.g., "Acme Health"): ')
    if (name.length === 0) {
      throw new Error('Extension name is required')
    }

    // Extension key
    const defaultKey = toCamelCase(name)
    const keyInput = await question(rl, `Extension key [${defaultKey}]: `)
    const key = keyInput.length > 0 ? keyInput : defaultKey

    // Description
    const descriptionInput = await question(rl, 'Extension description: ')
    const description =
      descriptionInput.length > 0
        ? descriptionInput
        : `${name} extension for Awell`

    // Settings
    const settings = await gatherSettings(rl)

    // Hello World action
    const includeHelloWorldAction = await confirm(
      rl,
      'Include a hello world action?',
    )

    // Hello World webhook
    const includeHelloWorldWebhook = await confirm(
      rl,
      'Include a hello world webhook?',
    )

    return {
      name,
      key,
      description,
      settings,
      includeHelloWorldAction,
      includeHelloWorldWebhook,
    }
  } finally {
    rl.close()
  }
}

function generateSettingsFile(config: ExtensionConfig): string {
  if (config.settings.length === 0) {
    return `import { type Setting } from '@awell-health/extensions-core'

export const settings = {} satisfies Record<string, Setting>
`
  }

  const settingsEntries = config.settings
    .map(
      (s) => `  ${s.key}: {
    key: '${s.key}',
    label: '${s.label}',
    obfuscated: ${String(s.obfuscated)},
    description: '${s.description}',
  }`,
    )
    .join(',\n')

  return `import { type Setting } from '@awell-health/extensions-core'

export const settings = {
${settingsEntries},
} satisfies Record<string, Setting>
`
}

function generateActionConfigFields(): string {
  return `import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  message: {
    id: 'message',
    label: 'Message',
    description: 'A message to log',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>
`
}

function generateActionConfigDataPoints(): string {
  return `import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  loggedMessage: {
    key: 'loggedMessage',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
`
}

function generateActionConfigIndex(): string {
  return `export { fields } from './fields'
export { dataPoints } from './datapoints'
`
}

function generateHelloWorldAction(_config: ExtensionConfig): string {
  return `import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints } from './config'

export const helloWorld: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'helloWorld',
  category: Category.DEMO,
  title: 'Hello World',
  description: 'A simple hello world action that logs a message.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { fields } = payload
    const message = fields.message ?? 'Hello, World!'

    // Log the message using the helpers
    helpers.log({ message }, 'Hello World Action')

    await onComplete({
      data_points: {
        loggedMessage: message,
      },
    })
  },
}
`
}

function generateHelloWorldActionIndex(): string {
  return `export { helloWorld } from './helloWorld'
`
}

function generateActionsIndex(config: ExtensionConfig): string {
  if (!config.includeHelloWorldAction) {
    return `// Export your actions here
// export * from './myAction'
`
  }

  return `export * from './helloWorld'
`
}

function generateHelloWorldWebhook(): string {
  return `import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'

const dataPoints = {
  eventType: {
    key: 'eventType',
    valueType: 'string',
  },
  payload: {
    key: 'payload',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export interface HelloWorldPayload {
  eventType: string
  data?: Record<string, unknown>
  patient_id?: string
}

export const helloWorldWebhook: Webhook<keyof typeof dataPoints, HelloWorldPayload> = {
  key: 'helloWorldWebhook',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess, onError) => {
    const { eventType, data, patient_id } = payload

    await onSuccess({
      data_points: {
        eventType,
        payload: JSON.stringify(data ?? {}),
      },
      ...(patient_id !== undefined ? { patient_id } : {}),
    })
  },
}

export type HelloWorldWebhook = typeof helloWorldWebhook
`
}

function generateWebhooksIndex(config: ExtensionConfig): string {
  if (!config.includeHelloWorldWebhook) {
    return `// Export your webhooks here
// import { myWebhook } from './myWebhook'
// export const webhooks = [myWebhook]
export const webhooks = []
`
  }

  return `import { helloWorldWebhook } from './helloWorldWebhook'

export const webhooks = [helloWorldWebhook]
`
}

function generateExtensionIndex(config: ExtensionConfig): string {
  const pascalName = toPascalCase(config.key)
  const hasActions = config.includeHelloWorldAction
  const hasWebhooks = config.includeHelloWorldWebhook

  const actionImports = hasActions
    ? `import { helloWorld } from './actions'`
    : ''
  const webhookImports = hasWebhooks
    ? `import { webhooks } from './webhooks'`
    : ''

  const actionsBlock = hasActions
    ? `  actions: {
    helloWorld,
  },`
    : `  actions: {},`

  const webhooksBlock = hasWebhooks ? `  webhooks,` : ''

  const actionImportsLine = actionImports.length > 0 ? actionImports + '\n' : ''
  const webhookImportsLine =
    webhookImports.length > 0 ? webhookImports + '\n' : ''

  return `${actionImportsLine}${webhookImportsLine}import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const ${pascalName}: Extension = {
  key: '${config.key}',
  title: '${config.name}',
  description: '${config.description}',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  category: Category.DEMO,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
${actionsBlock}
${webhooksBlock}
}
`
}

function generateReadme(config: ExtensionConfig): string {
  return `---
title: ${config.name}
description: ${config.description}
---
# ${config.name} extension

${config.description}

## Actions

${config.includeHelloWorldAction ? '- **Hello World**: A simple action that logs a message.' : 'No actions yet.'}

## Webhooks

${config.includeHelloWorldWebhook ? '- **Hello World Webhook**: A simple webhook that receives events.' : 'No webhooks yet.'}

## Settings

${config.settings.length > 0 ? config.settings.map((s) => `- **${s.label}**: ${s.description}`).join('\n') : 'No settings required.'}
`
}

function generateChangelog(config: ExtensionConfig): string {
  return `# ${config.name} changelog

## [Unreleased]

- Initial release
`
}

function updateExtensionsIndex(config: ExtensionConfig): void {
  const indexPath = path.join(EXTENSIONS_DIR, 'index.ts')
  let content = fs.readFileSync(indexPath, 'utf-8')

  const pascalName = toPascalCase(config.key)
  const importStatement = `import { ${pascalName} } from './${config.key}'`

  // Find the last import line that imports from a local extension
  const importLines = content
    .split('\n')
    .filter((line) => line.startsWith('import {') && line.includes("from './"))
  const lastImportIndex = content.lastIndexOf(
    importLines[importLines.length - 1],
  )
  const insertPosition = content.indexOf('\n', lastImportIndex) + 1

  // Insert the new import
  content =
    content.slice(0, insertPosition) +
    importStatement +
    '\n' +
    content.slice(insertPosition)

  // Find the extensions array and add the new extension
  // Insert before the closing bracket of the extensions array
  const arrayEndMatch = content.match(/export const extensions = \[[\s\S]*?\]/)
  if (arrayEndMatch !== null) {
    const arrayContent = arrayEndMatch[0]
    const lastEntryMatch = arrayContent.match(/(\s+)(\w+),?\s*\]$/)
    if (lastEntryMatch !== null) {
      const indent = lastEntryMatch[1]
      const lastEntry = lastEntryMatch[2]
      const newArrayContent = arrayContent.replace(
        new RegExp(`(${indent}${lastEntry}),?(\\s*\\])$`),
        `$1,${indent}${pascalName},$2`,
      )
      content = content.replace(arrayContent, newArrayContent)
    }
  }

  fs.writeFileSync(indexPath, content, 'utf-8')
  console.log(`✓ Updated extensions/index.ts`)
}

async function generateExtension(config: ExtensionConfig): Promise<void> {
  const extDir = path.join(EXTENSIONS_DIR, config.key)

  // Check if extension already exists
  if (fs.existsSync(extDir)) {
    throw new Error(`Extension directory already exists: ${extDir}`)
  }

  // Create directories
  fs.mkdirSync(extDir, { recursive: true })
  console.log(`✓ Created ${config.key}/`)

  if (config.includeHelloWorldAction) {
    fs.mkdirSync(path.join(extDir, 'actions', 'helloWorld', 'config'), {
      recursive: true,
    })
    console.log(`✓ Created ${config.key}/actions/helloWorld/config/`)
  }

  if (config.includeHelloWorldWebhook) {
    fs.mkdirSync(path.join(extDir, 'webhooks'), { recursive: true })
    console.log(`✓ Created ${config.key}/webhooks/`)
  }

  // Write files
  fs.writeFileSync(
    path.join(extDir, 'settings.ts'),
    generateSettingsFile(config),
  )
  console.log(`✓ Created ${config.key}/settings.ts`)

  fs.writeFileSync(
    path.join(extDir, 'index.ts'),
    generateExtensionIndex(config),
  )
  console.log(`✓ Created ${config.key}/index.ts`)

  fs.writeFileSync(path.join(extDir, 'README.md'), generateReadme(config))
  console.log(`✓ Created ${config.key}/README.md`)

  fs.writeFileSync(path.join(extDir, 'CHANGELOG.md'), generateChangelog(config))
  console.log(`✓ Created ${config.key}/CHANGELOG.md`)

  if (config.includeHelloWorldAction) {
    // Create config files
    fs.writeFileSync(
      path.join(extDir, 'actions', 'helloWorld', 'config', 'fields.ts'),
      generateActionConfigFields(),
    )
    console.log(`✓ Created ${config.key}/actions/helloWorld/config/fields.ts`)

    fs.writeFileSync(
      path.join(extDir, 'actions', 'helloWorld', 'config', 'datapoints.ts'),
      generateActionConfigDataPoints(),
    )
    console.log(
      `✓ Created ${config.key}/actions/helloWorld/config/datapoints.ts`,
    )

    fs.writeFileSync(
      path.join(extDir, 'actions', 'helloWorld', 'config', 'index.ts'),
      generateActionConfigIndex(),
    )
    console.log(`✓ Created ${config.key}/actions/helloWorld/config/index.ts`)

    // Create action files
    fs.writeFileSync(
      path.join(extDir, 'actions', 'helloWorld', 'helloWorld.ts'),
      generateHelloWorldAction(config),
    )
    console.log(`✓ Created ${config.key}/actions/helloWorld/helloWorld.ts`)

    fs.writeFileSync(
      path.join(extDir, 'actions', 'helloWorld', 'index.ts'),
      generateHelloWorldActionIndex(),
    )
    console.log(`✓ Created ${config.key}/actions/helloWorld/index.ts`)

    // Create actions index
    fs.writeFileSync(
      path.join(extDir, 'actions', 'index.ts'),
      generateActionsIndex(config),
    )
    console.log(`✓ Created ${config.key}/actions/index.ts`)
  }

  if (config.includeHelloWorldWebhook) {
    fs.writeFileSync(
      path.join(extDir, 'webhooks', 'helloWorldWebhook.ts'),
      generateHelloWorldWebhook(),
    )
    console.log(`✓ Created ${config.key}/webhooks/helloWorldWebhook.ts`)

    fs.writeFileSync(
      path.join(extDir, 'webhooks', 'index.ts'),
      generateWebhooksIndex(config),
    )
    console.log(`✓ Created ${config.key}/webhooks/index.ts`)
  }

  // Update the main extensions index
  updateExtensionsIndex(config)
}

async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('name', {
      alias: 'n',
      type: 'string',
      description: 'Extension name',
    })
    .option('key', {
      alias: 'k',
      type: 'string',
      description: 'Extension key (camelCase)',
    })
    .option('description', {
      alias: 'd',
      type: 'string',
      description: 'Extension description',
    })
    .option('with-action', {
      type: 'boolean',
      default: false,
      description: 'Include a hello world action',
    })
    .option('with-webhook', {
      type: 'boolean',
      default: false,
      description: 'Include a hello world webhook',
    })
    .option('interactive', {
      alias: 'i',
      type: 'boolean',
      default: true,
      description: 'Run in interactive mode',
    })
    .help()
    .alias('help', 'h')
    .parseAsync()

  let config: ExtensionConfig

  if (argv.interactive && argv.name === undefined) {
    // Interactive mode
    config = await gatherConfig()
  } else {
    // Non-interactive mode
    if (argv.name === undefined || argv.name.length === 0) {
      console.error('Error: Extension name is required in non-interactive mode')
      process.exit(1)
    }

    config = {
      name: argv.name,
      key: argv.key ?? toCamelCase(argv.name),
      description: argv.description ?? `${argv.name} extension for Awell`,
      settings: [],
      includeHelloWorldAction: argv['with-action'],
      includeHelloWorldWebhook: argv['with-webhook'],
    }
  }

  console.log('\n📦 Generating extension with the following configuration:')
  console.log(`   Name: ${config.name}`)
  console.log(`   Key: ${config.key}`)
  console.log(`   Description: ${config.description}`)
  console.log(
    `   Settings: ${config.settings.length > 0 ? config.settings.map((s) => s.key).join(', ') : 'None'}`,
  )
  console.log(
    `   Hello World Action: ${config.includeHelloWorldAction ? 'Yes' : 'No'}`,
  )
  console.log(
    `   Hello World Webhook: ${config.includeHelloWorldWebhook ? 'Yes' : 'No'}`,
  )
  console.log('')

  try {
    await generateExtension(config)
    console.log(`\n✅ Extension "${config.name}" generated successfully!`)
    console.log(`\nNext steps:`)
    console.log(`   1. Review the generated files in extensions/${config.key}/`)
    console.log(
      `   2. Update the icon_url in index.ts with your extension's icon`,
    )
    console.log(`   3. Update the category in index.ts (currently set to DEMO)`)
    console.log(`   4. Run 'yarn build' to compile`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`\n❌ Error: ${errorMessage}`)
    process.exit(1)
  }
}

void main()
