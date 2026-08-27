/**
 * Zod 3 -> 4 migration sweep.
 *
 * Walks every non-test module under `extensions/` that imports zod, requires
 * it, and for every exported value that looks like a zod schema asserts that
 * `safeParse` runs to completion on `{}` and `undefined` (i.e. the schema
 * constructs and evaluates without throwing). This catches schemas that were
 * mis-migrated (invalid option bags, removed APIs, wrong argument shapes)
 * regardless of whether the extension has dedicated tests.
 */
import * as fs from 'fs'
import * as path from 'path'

const EXTENSIONS_ROOT = path.resolve(__dirname, '..', 'extensions')

/**
 * Modules that cannot be required under jest (path is relative to
 * `extensions/`). Keep this list short and explain every entry.
 */
const EXCLUDED_MODULES: Array<{ path: string; reason: string }> = []

/** Sites the migration touched that the sweep MUST cover. */
const REQUIRED_COVERAGE: RegExp[] = [
  /^awellTasks\/api\/schema\//,
  /calDotCom\/.*GetBooking\.schema\.ts$/,
  /freshdesk\/.*AddNote\.schema\.ts$/,
  /freshdesk\/.*UpdateTicket\.schema\.ts$/,
  /^elation\/validation\/careGap\.zod\.ts$/,
  /dockHealth\/.*task\.schema\.ts$/,
  /^bland\/api\/schema\//,
  /landingAi\/.*\.schema\.ts$/,
]

const isTestOrMock = (rel: string): boolean =>
  /(\.|-)test\.ts$/.test(rel) ||
  /\.mock\.ts$/.test(rel) ||
  /\.d\.ts$/.test(rel) ||
  rel
    .split(path.sep)
    .some((seg) => ['__tests__', '__mocks__', 'generated'].includes(seg))

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walk(full, out)
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(full)
    }
  }
  return out
}

const importsZod = (file: string): boolean =>
  /from\s+['"]zod(\/.*)?['"]/.test(fs.readFileSync(file, 'utf8'))

const isZodSchema = (value: unknown): boolean =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { safeParse?: unknown }).safeParse === 'function' &&
  typeof (value as { parse?: unknown }).parse === 'function'

interface DiscoveredSchema {
  module: string
  exportName: string
  schema: { safeParse: (input: unknown) => { success: boolean } }
}

const modules = walk(EXTENSIONS_ROOT)
  .map((file) => path.relative(EXTENSIONS_ROOT, file))
  .filter((rel) => !isTestOrMock(rel))
  .filter((rel) => importsZod(path.join(EXTENSIONS_ROOT, rel)))
  .filter((rel) => !EXCLUDED_MODULES.some((e) => e.path === rel))
  .sort()

const schemas: DiscoveredSchema[] = []
const failedImports: Array<{ module: string; error: string }> = []

for (const rel of modules) {
  let mod: Record<string, unknown>
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require(path.join(EXTENSIONS_ROOT, rel))
  } catch (err) {
    failedImports.push({ module: rel, error: String(err) })
    continue
  }
  for (const [exportName, value] of Object.entries(mod)) {
    if (isZodSchema(value)) {
      schemas.push({
        module: rel,
        exportName,
        schema: value as DiscoveredSchema['schema'],
      })
    }
  }
}

describe('zod schema sweep', () => {
  it('discovers zod modules and exported schemas', () => {
    // eslint-disable-next-line no-console
    console.log(
      `zod sweep: ${modules.length} modules importing zod, ` +
        `${schemas.length} exported schemas, ` +
        `${failedImports.length} modules failed to import`,
    )
    expect(modules.length).toBeGreaterThan(100)
    expect(schemas.length).toBeGreaterThan(100)
  })

  it('imports every zod module without throwing', () => {
    expect(failedImports).toEqual([])
  })

  it.each(REQUIRED_COVERAGE.map((re) => [re.source, re]))(
    'covers %s',
    (_, re) => {
      const covered = schemas.filter((s) => re.test(s.module))
      expect(covered.length).toBeGreaterThan(0)
    },
  )

  describe.each(
    schemas.map((s) => [`${s.module} :: ${s.exportName}`, s.schema] as const),
  )('%s', (_, schema) => {
    it('safeParse({}) completes', () => {
      const result = schema.safeParse({})
      expect(typeof result.success).toBe('boolean')
    })

    it('safeParse(undefined) completes', () => {
      const result = schema.safeParse(undefined)
      expect(typeof result.success).toBe('boolean')
    })
  })
})
