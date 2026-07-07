---
name: testing-awell-extensions
description: >-
  Run, test, and verify an EXISTING Awell extension in this monorepo — execute
  an action or replay a webhook against the real handler, run its Jest tests, and
  interpret failures. Use whenever the task is "test / run / try / verify / debug
  extension X" or "does action Y work". For BUILDING or editing an extension, use
  the building-awell-extensions skill instead.
argument-hint: <extension>/<action-or-webhook> to test (e.g. slack/sendMessageToChannel)
allowed-tools: Read, Grep, Glob, Bash(yarn cli:*), Bash(yarn test), Bash(yarn test-file:*), Bash(yarn test-local), Bash(yarn build), Bash(yarn compile)
---

# Testing & Running Awell Extensions

> **Purpose:** Exercise an existing extension and report what actually happened — via the real handler (CLI) or mocked unit tests (Jest).
> **Scope:** Running/testing extensions under `extensions/`. To *build or edit* one, use `building-awell-extensions`.

## Rule 0 — get facts from the CLI; get values from the user (read first)

Two different things, two different sources — never guess either:

- **Keys and field *names*** (extension/action/webhook keys, field ids/types/required) are **facts about the repo**. Get them from `yarn cli list` and `yarn cli describe <ext>/<action>` — never from memory or a plausible-looking example, and don't read `config/fields.ts` (describe gives the same thing without exploring source).
- **Field *values*** (the actual channel, message, phone number, patient id …) are the **user's to provide**. `describe` gives you the shape, not the contents. Ask the user and wait — do not fabricate values for a live `run` (see "Run the real handler" — it has real side effects).

Do not copy an example key from docs or another skill without confirming it appears in `yarn cli list`.

## Two ways to test (complementary, not substitutes)

| Approach | Command | What it proves | Hits real APIs? | Needs credentials? |
|----------|---------|----------------|-----------------|--------------------|
| **Mocked unit tests** | `yarn test` | Handler logic + error mapping against mocks | No | No |
| **Real execution** | `yarn cli run` / `webhook replay` | End-to-end behavior against the live vendor | Yes | Yes |

Run **both** when verifying real work: `yarn test` for fast regression safety, `yarn cli run` to prove it actually runs.

## Discover (before running anything)

```bash
yarn cli list                              # real extension / action / webhook keys
yarn cli describe <ext>/<action>           # fields (+types+required), data points, settings status
yarn cli describe <ext>/<action> --json    # same, machine-readable
yarn cli env <ext>                          # env var NAMES an extension expects (never values)
yarn cli doctor <ext>                       # which settings are set vs missing in the current .env
```

`describe` prints an example with **placeholder** values (`"channel":"…"`) — it gives you the field *shape*, not what to put in them.

## Run the real handler

> **A live `run` has real, outward-facing side effects.** It executes the real handler against the live vendor: `slack/sendMessageToChannel` posts an actual message, `twilio/sendSms` sends an actual text, `*/create*` / `*/update*` / `*/delete*` mutate real vendor data. Treat it like sending an email, not like a dry run.

> **Field VALUES are the user's — never fabricate them.** `describe` tells you *that* a `channel` and `message` are required; it does **not** tell you which channel or what message. Do **not** invent them (no "#general", no "Hello from the CLI test"). **Ask the user for the real values and wait for the answer before running.** If you catch yourself asking a question and then running the command in the same step, stop — that means you answered it yourself. Proposing an example command is fine; *executing* one on made-up input is not.
>
> - **Side-effecting actions** (`send*`, `create*`, `update*`, `delete*`, anything that writes): get the real values from the user and confirm before running.
> - **Read-only actions** (`get*`, `search*`, `list*`): fine to run once the user gives you the real identifier(s) to look up — still don't guess IDs.

```bash
# Action — real values supplied by the user, not invented
yarn cli run <ext>/<action> --fields '{"field":"<real value from user>"}' --json
yarn cli run <ext>/<action> --fields-file ./payload.json        # large payloads
#   optional context: --patient-id --pathway-id --activity-id

# Webhook — replay a saved fixture through the real handler
yarn cli webhook replay <ext>/<webhook> --payload-file ./fixture.json --json
```

Env vars follow `<EXTENSION_KEY_UPPER>_<SETTING_KEY_UPPER>` (e.g. `bland` + `apiKey` → `BLAND_APIKEY`). Compile first (`yarn build`) if you changed code.

## Read the result — let the `error` object drive your next move

On success you get `status: complete` with `data_points`/`events`. On failure the result includes a structured `error` — **use it to decide, don't retry blindly:**

| `errorClass` | `isRetryable` | What to do |
|--------------|---------------|------------|
| `transient` (`SERVER_ERROR`) | `true` | Retry unchanged; if it persists the vendor is likely down |
| `validation` (`WRONG_INPUT`/`WRONG_DATA`/`MISSING_FIELDS`) | `false` | Fix the `--fields` JSON to satisfy the schema, then re-run |
| `config` (`MISSING_SETTINGS`) | `false` | Settings missing → see "credentials" below |
| `business` (`BAD_REQUEST`) | `false` | Vendor rejected on business grounds — inspect the message; do **not** retry unchanged |

A non-zero `status` is a real finding to report, not a CLI bug.

## Credentials are the user's to provide

If `doctor` shows missing required settings, **stop and ask the user for the secret values** — do not fabricate them. You can scaffold the blank env vars for them:

```bash
yarn cli setup <ext>     # writes empty stubs (SLACK_BOTTOKEN=…) into .env for missing settings
```

The user then fills in the values in `.env` (secrets go into the file, never into a command or the chat). Re-run `yarn cli doctor <ext>` to confirm and proceed. This is a legitimate escalation, not a failure.

## Mocked unit tests (Jest)

**To run one extension or file, use `yarn test-file <pattern>` — NOT `yarn test <path>`.**

```bash
yarn test-file sendMessageToChannel        # scope by action/file name (regex, matched against the path)
yarn test-file extensions/slack/           # scope to a whole extension
yarn test                                  # ⚠️ ALL 300+ test files + the global field-validation flood — only for a full run
yarn test-local                            # include *.local.test.ts (hit real APIs)
```

> **Footgun — do not append a path to `yarn test`.** The `test` script ends in `--testPathIgnorePatterns`, a greedy array option. `yarn test extensions/slack/foo.test.ts` makes Jest treat `foo.test.ts` as an *ignore* pattern — so it runs **every other** test (300+ files, thousands of lines, and the noisy global `extensions.test.ts` field check) and skips the one you wanted. Always use `yarn test-file <pattern>` (it pins `--testPathPattern`), and never run bare `yarn test` just to check a single extension.

Tests are co-located with the handler and use `TestHelpers.fromAction(action)` / `TestHelpers.fromWebhook(webhook)` from `@awell-health/extensions-core` (returns `{ onComplete, onError, helpers, extensionAction }`), with the vendor client mocked via `__mocks__/` or `jest.mock('../../lib/client')`. Fixtures live in `__testdata__/`.

## Standard flow

1. `yarn cli list` — find the real keys.
2. `yarn cli describe <ext>/<action>` — learn the required fields + settings.
3. `yarn cli doctor <ext>` — confirm credentials; if missing, `yarn cli setup <ext>` scaffolds the blank env vars for the user to fill in.
4. **Ask the user for the field values** (channel, message, phone, id, …). Do not invent them; wait for the answer.
5. `yarn cli run <ext>/<action> --fields '<user's real values>' --json` — execute; inspect `status`, `data_points`, `events`, `error`.
6. Act on the `error` classification (retry / fix fields / escalate).
7. `yarn test-file <ext-or-action>` — mocked regression pass (scoped; never bare `yarn test` for one extension).
