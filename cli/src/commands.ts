import { findExtension, findAction, listExtensions } from './registry'
import { resolveSettings, envPath, writeEnvVars } from './env'

export const cmdList = (): void => {
  const exts = listExtensions()
  for (const ext of exts) {
    const actions = Object.values(ext.actions).map((a) => a.key)
    const webhooks = (ext.webhooks ?? []).map((w) => w.key)
    process.stdout.write(`${ext.key}\n`)
    if (actions.length > 0)
      process.stdout.write(`  actions: ${actions.join(', ')}\n`)
    if (webhooks.length > 0)
      process.stdout.write(`  webhooks: ${webhooks.join(', ')}\n`)
  }
}

export const cmdEnv = (extensionKey: string): void => {
  const ext = findExtension(extensionKey)
  if (ext === undefined) {
    throw new Error(`Extension ${extensionKey} not found`)
  }
  const resolved = resolveSettings(extensionKey, ext.settings)
  process.stdout.write(`# ${ext.title} (${ext.key})\n`)
  for (const r of resolved) {
    const req = r.setting.required === true ? ' [required]' : ''
    const obf = r.setting.obfuscated ? ' [secret]' : ''
    process.stdout.write(`${r.envVar}=${req}${obf}\n`)
    if (r.setting.description !== undefined && r.setting.description !== '') {
      process.stdout.write(`# ${r.setting.description}\n`)
    }
  }
}

export const cmdDoctor = (extensionKey: string): void => {
  const ext = findExtension(extensionKey)
  if (ext === undefined) {
    throw new Error(`Extension ${extensionKey} not found`)
  }
  const resolved = resolveSettings(extensionKey, ext.settings)
  let allOk = true
  for (const r of resolved) {
    const status = r.present ? 'set' : 'missing'
    if (!r.present && r.setting.required === true) allOk = false
    process.stdout.write(`  ${r.setting.key} (${r.envVar}): ${status}\n`)
  }
  process.stdout.write(
    allOk
      ? `\nAll required settings present in env.\n`
      : `\nSome required settings are missing. Run: awell-ext setup ${extensionKey}\n`,
  )
}

export const cmdDescribe = (
  extensionKey: string,
  actionKey: string,
  opts: { json: boolean },
): void => {
  const ext = findExtension(extensionKey)
  if (ext === undefined) {
    throw new Error(`Extension ${extensionKey} not found`)
  }
  const action = findAction(extensionKey, actionKey)
  if (action === undefined) {
    throw new Error(
      `Action ${actionKey} not found in extension ${extensionKey}. Run: awell-ext list`,
    )
  }

  const fields = Object.values(action.fields ?? {}).map((f: any) => ({
    id: String(f.id),
    type: String(f.type),
    required: f.required === true,
    label: f.label as string | undefined,
    description: f.description as string | undefined,
  }))
  const dataPoints = Object.values(action.dataPoints ?? {}).map((d: any) => ({
    key: String(d.key),
    valueType: String(d.valueType),
  }))
  const settings = resolveSettings(extensionKey, ext.settings).map((r) => ({
    key: r.setting.key,
    envVar: r.envVar,
    required: r.setting.required === true,
    present: r.present,
  }))

  const described = {
    extension: extensionKey,
    action: action.key,
    title: action.title,
    category: (action as any).category,
    previewable: (action as any).previewable,
    supports_automated_retries: (action as any).supports_automated_retries,
    fields,
    dataPoints,
    settings,
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify(described, null, 2) + '\n')
    return
  }

  const lines: string[] = []
  lines.push(`${action.title} — ${extensionKey}/${action.key}`)
  lines.push('')
  lines.push('fields (pass as --fields JSON):')
  if (fields.length === 0) lines.push('  (none)')
  for (const f of fields) {
    lines.push(
      `  ${f.id}: ${f.type}${f.required ? ' [required]' : ' [optional]'}`,
    )
    if (f.description !== undefined && f.description !== '')
      lines.push(`    ${f.description}`)
  }
  lines.push('')
  lines.push('data_points (emitted on success):')
  if (dataPoints.length === 0) lines.push('  (none)')
  for (const d of dataPoints) lines.push(`  ${d.key}: ${d.valueType}`)
  lines.push('')
  lines.push('settings (needed to run):')
  if (settings.length === 0) lines.push('  (none)')
  for (const s of settings) {
    lines.push(
      `  ${s.key} (${s.envVar})${s.required ? ' [required]' : ''}: ${s.present ? 'set' : 'missing'}`,
    )
  }
  const requiredFields = fields
    .filter((f) => f.required)
    .map((f) => `"${f.id}":"…"`)
  lines.push('')
  lines.push(
    `example: awell-ext run ${extensionKey}/${action.key} --fields '{${requiredFields.join(',')}}'`,
  )
  process.stdout.write(lines.join('\n') + '\n')
}

export const cmdSetup = (extensionKey: string): void => {
  const ext = findExtension(extensionKey)
  if (ext === undefined) {
    throw new Error(`Extension ${extensionKey} not found`)
  }
  const resolved = resolveSettings(extensionKey, ext.settings)
  const missing = resolved.filter((r) => !r.present)

  process.stdout.write(`Setting up ${ext.title} (${ext.key})\n`)
  if (missing.length === 0) {
    process.stdout.write(
      `All settings already present in ${envPath()} — nothing to scaffold.\n`,
    )
    return
  }

  // Non-interactive: write empty stubs for the missing vars into .env. The user
  // fills in the values (secrets go straight into the file, never a terminal).
  // Existing values are never overwritten (only settings with no value are stubbed).
  writeEnvVars(missing.map((r) => ({ envVar: r.envVar, value: '' })))

  process.stdout.write(
    `\nAdded ${missing.length} stub(s) to ${envPath()} — fill in the values:\n`,
  )
  for (const r of missing) {
    const req = r.setting.required === true ? ' [required]' : ''
    const secret = r.setting.obfuscated ? ' [secret]' : ''
    process.stdout.write(`  ${r.envVar}=${req}${secret}\n`)
    if (r.setting.description !== undefined && r.setting.description !== '') {
      process.stdout.write(`    # ${r.setting.description}\n`)
    }
  }
  process.stdout.write(`\nThen verify with: awell-ext doctor ${extensionKey}\n`)
}
