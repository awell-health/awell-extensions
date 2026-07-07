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

| Command | What it does |
| --- | --- |
| `list` | List every registered extension with its action and webhook keys. Use first to confirm a new extension is registered. |
| `describe <ext>/<action> [--json]` | Print an action's input fields (id, type, required), data points, and settings status — build the correct `--fields` JSON without reading source. |
| `env <ext>` | Print the env var **names** an extension expects (never values). |
| `doctor <ext>` | Show which settings are set vs missing in the current env (no values revealed). Run before `run`. |
| `setup <ext>` | Scaffold the extension's missing settings as empty stubs in `.env` for you to fill in (existing values untouched). |
| `run <ext>/<action> [--fields JSON \| --fields-file path] [--patient-id] [--pathway-id] [--activity-id] [--json]` | Execute a real action handler and print its result. |
| `webhook replay <ext>/<webhook> [--payload JSON \| --payload-file path] [--headers JSON \| --headers-file path] [--json]` | Replay a vendor webhook payload through the real webhook handler. |

## Examples

```bash
yarn cli list
yarn cli describe slack/sendMessageToChannel --json
yarn cli doctor slack
yarn cli run slack/sendMessageToChannel --fields '{"channel":"#general","message":"hi"}' --json
yarn cli webhook replay bland/callCompleted --payload-file ./fixture.json
```

## Design

The CLI is written to be **registry-agnostic**. All command logic works off an
injected registry (`src/registry.ts`); the entry point (`src/index.ts`) is the only
place that imports this repo's `../../extensions` and injects it via `setRegistry()`.
This keeps the CLI decoupled from any specific repo so it can be extracted into its
own package later — a consumer would then supply its own registry. `package.json`
declares the CLI's dependency contract for that future extraction; it is `private`
and not yet published.

## Local development

**Editing extensions in this repo.** No setup needed. The CLI imports
`../../extensions` via `ts-node`, so any change under `extensions/` is picked up on the next `yarn cli ...` invocation — no build, no relink.
