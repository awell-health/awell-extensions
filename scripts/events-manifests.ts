/**
 * Write the events manifest of every extension that declares ingestion
 * endpoints, one file per extension key:
 *
 *   dist/events-manifests/<key>.json
 *
 * published under the `./events-manifest/*` exports subpath, so the extension
 * server finds one with
 * `require.resolve('@awell-health/awell-extensions/events-manifest/<key>')`.
 *
 * Each manifest comes from extensions-core's `events-manifest` command, which
 * reads what each endpoint's `run` publishes from the source. That command
 * finds one extension in a repo by convention; this repo holds many, so the
 * registry is injected (`runCli`) and each manifest written to its own path.
 * Run from the repo root, so the analysis starts at `src/index.ts` and sees
 * every extension's source.
 *
 * Runs at the end of `yarn build`, so every publish ships the manifests and
 * the PR build checks them. A failure for any extension exits non-zero; a
 * publish whose key is not a string literal is warned about, not fatal.
 */
import { rmSync } from 'fs'
import { runCli } from '@awell-health/extensions-core/dist/cli'
import { extensions } from '../extensions'

const OUT_DIR = 'dist/events-manifests'

const keys = extensions
  .filter((extension) => (extension.ingestion ?? []).length > 0)
  .map((extension) => extension.key)

// A manifest left by an earlier build would ship for an extension that no
// longer declares ingestion.
rmSync(OUT_DIR, { recursive: true, force: true })

// `runCli` reports a failed command on stderr and sets `process.exitCode`, so
// one extension's failure fails the script without hiding the others'.
for (const key of keys) {
  runCli(extensions, [
    'events-manifest',
    key,
    '--out',
    `${OUT_DIR}/${key}.json`,
  ])
}
