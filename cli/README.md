# Awell extension CLI

A dev tool for working with the extensions in this repo. Unlike `yarn test` (which
runs handlers against mocks), the CLI executes the **real** action and webhook
handlers so you get true runtime feedback — status, `data_points`, `events`, and a
structured `error` classification.

Run it from the repo root:

```bash
yarn cli <command> [args]
```

## Commands

| Command                                                                                                                   | What it does                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list`                                                                                                                    | List every registered extension with its action and webhook keys. Use first to confirm a new extension is registered.                             |
| `describe <ext>/<action> [--json]`                                                                                        | Print an action's input fields (id, type, required), data points, and settings status — build the correct `--fields` JSON without reading source. |
| `env <ext>`                                                                                                               | Print the env var **names** an extension expects (never values).                                                                                  |
| `doctor <ext>`                                                                                                            | Show which settings are set vs missing in the current env (no values revealed). Run before `run`.                                                 |
| `setup <ext>`                                                                                                             | Scaffold the extension's missing settings as empty stubs in `.env` for you to fill in (existing values untouched).                                |
| `run <ext>/<action> [--fields JSON \| --fields-file path] [--patient-id] [--pathway-id] [--activity-id] [--json]`         | Execute a real action handler and print its result.                                                                                               |
| `webhook replay <ext>/<webhook> [--payload JSON \| --payload-file path] [--headers JSON \| --headers-file path] [--json]` | Replay a vendor webhook payload through the real webhook handler.                                                                                 |

## Examples

```bash
yarn cli list
yarn cli describe slack/sendMessageToChannel --json
yarn cli doctor slack
yarn cli run slack/sendMessageToChannel --fields '{"channel":"#general","message":"hi"}' --json
yarn cli webhook replay bland/callCompleted --payload-file ./fixture.json
```

## Using it in your own extension repo

The CLI is published as **`@awell-health/extension-cli`** so a repo that holds a
single extension of its own gets the same runtime feedback loop without
vendoring a copy.

Add it as a dev dependency:

```bash
yarn add -D @awell-health/extension-cli
```

Create a composition root that injects your extension — this is the only glue
code you need:

```ts
// cli.ts
import { runCli } from '@awell-health/extension-cli'
import MyExtension from './src'

runCli([MyExtension])
```

And a script to run it:

```json
{
  "scripts": {
    "cli": "ts-node --transpile-only ./cli.ts"
  }
}
```

Then every command in the table above works against your extension:

```bash
yarn cli list
yarn cli describe <yourKey>/<action>
yarn cli doctor <yourKey>
```

`@awell-health/extensions-core` is a **peer** dependency: the CLI deliberately
uses _your_ copy, so the handler classes and payload types it constructs are the
same ones your extension was compiled against.

## Design

The CLI is **registry-agnostic**. All command logic works off an injected
registry (`src/registry.ts`), and `runCli(registry)` (`src/cli.ts`) takes that
registry as its first argument. Nothing under `src/` imports a specific repo's
extensions.

The composition roots are the only place that knows about a concrete registry:

| File          | Registry                    | Used by                 |
| ------------- | --------------------------- | ----------------------- |
| `local.ts`    | `../extensions` (this repo) | `yarn cli` here         |
| your `cli.ts` | `[MyExtension]`             | `yarn cli` in your repo |

`src/index.ts` is the published package entry and exports `runCli` plus the
registry helpers and types.

## Local development

**Editing extensions in this repo.** No setup needed. `local.ts` imports
`../extensions` via `ts-node`, so any change under `extensions/` is picked up on the next `yarn cli ...` invocation — no build, no relink.

**Publishing.** Automatic. Any change under `cli/` that lands on `main` triggers
the **Publish extension CLI** workflow, which lints, typechecks, tests, builds,
bumps the patch version, pushes that bump back to `main`, and publishes to npm.

**Do not hand-edit `version` in `cli/package.json`** — CI owns it, exactly as it
owns the root package's version, and `check-repo-conventions.sh` blocks a manual
bump in a PR.

To inspect a build without releasing anything, dispatch the workflow manually
with `dry_run` ticked: it packs the tarball and prints its contents, skipping the
bump, the push and the publish.
