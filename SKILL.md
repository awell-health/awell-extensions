---
name: building-awell-extensions
description: >-
  Build or extend an Awell extension in this monorepo from a vendor's API docs
  and a user's intent (e.g. "add an action that sends an SMS via Vendor X",
  "add a webhook for booking.created"). Use whenever the task is to create a new
  extension under extensions/ or add an action/webhook/setting to an existing
  one. Covers the full loop: plan → scaffold → implement (settings, actions,
  webhooks, error mapping) → test → run/verify with the CLI → PR. Do NOT use for
  unrelated repo work (src/lib/, the extensions-core framework, CI config, or
  root dependency changes without an extension need).
argument-hint: <vendor name> + what the extension should do (action/webhook); attach or link the vendor API docs
allowed-tools: Read, Grep, Glob, Edit, Write, Agent, Bash(yarn build), Bash(yarn compile), Bash(yarn test), Bash(yarn test-file:*), Bash(yarn test-local), Bash(yarn lint), Bash(yarn generate-extension:*), Bash(yarn cli:*)
---

# Building Awell Extensions — Agent Skill

> **Purpose:** Take a vendor's API docs + a user's intent ("I want an action that does X") and produce a correctly-structured, working Awell extension — or addition to an existing one — in this repo.
>
> **Scope:** Building/editing extensions under `extensions/`. **Do NOT use this skill for** unrelated repo work (modifying `src/lib/`, the `extensions-core` framework itself, CI config, or root `package.json` deps without an explicit extension need). **Do NOT use this skill to** generate a JSON manifest, a per-extension `package.json`, or `onActivityCreated` handlers for new code — these are deprecated/wrong patterns.

This skill is derived from analysing 15 existing extensions (slack, hubspot, stripe, healthie, elation, epic, twilio, bland, sendgrid-extension, docuSign, dropboxSign, calDotCom, medplum, metriport, athenahealth). Follow it precisely.

---

## 0. Persistent facts (read first — never summarise away)

These facts are load-bearing. If you are summarising your work or delegating to a subagent, copy this block verbatim into the subagent's prompt. Violating any of them produces code that fails CI or behaves wrong in production.

- **There is no JSON manifest.** An extension is a TypeScript `Extension` object exported from `extensions/<key>/index.ts`. Do not create `*.json` manifest files.
- **Monorepo.** No per-extension `package.json`. All deps live in the **repo root** `package.json`. Do not create one per extension. Do not add a dep without first checking the root `package.json`.
- **Framework:** `@awell-health/extensions-core` provides types (`Extension`, `Action`, `Webhook`, `Setting`, `Field`, `DataPointDefinition`), enums (`Category`, `AuthorType`, `FieldType`, `StringType`), a `validate()` helper, OAuth base classes (`APIClient`, `DataWrapper`, `OAuthClientCredentials`, `OAuthPassword`), `fetchTyped`, shared Zod schemas, and `TestHelpers`.
- **Validation is dual.** Declarative metadata objects (for the Studio UI) + parallel Zod schemas (for runtime). Both must stay in sync. The `Field.id` MUST equal its object key in `fields` (CI-enforced).
- **Use `onEvent` for new action/webhook handlers.** `onActivityCreated` / `onWebhookReceived` are deprecated but still present in older code — do not copy them as a template for new work.
- **All `data_points` values are strings at the callback boundary.** `JSON.stringify` objects, `String()` numbers/booleans.
- **CI enforces:** every extension must have non-empty `README.md` (YAML frontmatter) and `CHANGELOG.md`.
- **Categories enum:** `EHR_INTEGRATIONS`, `COMMUNICATION`, `CUSTOMER_SUPPORT`, `BILLING`, `DOCUMENT_MANAGEMENT`, `SCHEDULING`, `DEMO`, and others — pick the closest match.
- **Never invent extension/action/webhook/field keys.** They are facts about the repo — get real ones from `yarn cli list` and `yarn cli describe <ext>/<action>`, not from memory, docs, or a plausible-looking example. A fabricated key produces commands that silently target nothing.

> **Deterministic enforcement:** the "no JSON manifests" rule in this section is enforced in CI by `.github/workflows/conventions.yml` (which runs `.github/scripts/check-repo-conventions.sh`). The `Field.id == key` and README/CHANGELOG rules below are enforced by `src/__tests__/extensions.test.ts`. Other rules in this file are prompt-based — follow them, but expect deterministic enforcement to be added for high-impact ones over time.

---

## 0.1. Decision matrix — jump straight to the right template

Use this table to route. Do not read the whole file before deciding.

| Vendor API shape | Auth | Client pattern (§6 ref) | Template extension to copy | Webhook template |
|------------------|------|-------------------------|---------------------------|------------------|
| REST + API key | Bearer / query param | §6.2 Custom axios | `extensions/bland`, `extensions/metriport` | `extensions/bland/webhooks/CallCompleted` |
| REST + OAuth client credentials | `OAuthClientCredentials` | §6.3 `APIClient`+`DataWrapper` | `extensions/athenahealth`, `extensions/elation` | `extensions/elation/webhooks` |
| REST + OAuth password | `OAuthPassword` | §6.3 | `extensions/elation` (legacy path) | — |
| Official vendor SDK exists | SDK constructor | §6.1 Thin wrapper | `extensions/slack`, `extensions/twilio`, `extensions/stripe`, `extensions/sendgrid-extension` | n/a (vendor doesn't push) |
| FHIR R4 | SMART Backend Services JWT / client credentials | §6.4 | `extensions/epic`, `extensions/medplum` | `extensions/medplum/webhooks/ObservationCreated` |
| GraphQL | `Authorization: Basic <key>` / Bearer | §6.5 | `extensions/healthie` | `extensions/healthie/webhooks` |
| Stakeholder-actionable embedded UI (signing, booking widget) | n/a in handler | §4.4 — handler validates only | `extensions/docuSign/actions/embeddedSigning`, `extensions/calDotCom/actions/bookAppointment` | — |
| Async action → webhook completion | Vendor callback URL with `activity_id` | §4.5 | `extensions/bland` | `extensions/bland/webhooks/CallCompleted` |
| Polling / async job status | Per vendor | §4 + loop | `extensions/sendgrid-extension/v1/actions/importStatus`, `extensions/metriport` consolidated query | — |

**Tool-trimming when reading vendor API docs:** extract only the endpoint(s), field(s), and error codes needed for the user's requested action. Do not mirror the vendor's entire API surface into the extension — each action is a thin, purpose-built slice. Adding "everything the API can do" is an anti-pattern.

---

## 1. Standard extension layout

```
extensions/<key>/
├── index.ts            # Extension manifest (typed object) — REQUIRED
├── settings.ts         # settings + SettingsValidationSchema — REQUIRED
├── README.md           # YAML frontmatter + setup + per-action docs — REQUIRED
├── CHANGELOG.md        # — REQUIRED
├── actions/
│   ├── index.ts        # barrel: export const actions = { ... } OR default object
│   └── <actionKey>/
│       ├── index.ts                 # re-export the action
│       ├── <actionKey>.ts           # Action object with handler
│       ├── <actionKey>.test.ts      # optional but recommended
│       └── config/
│           ├── index.ts             # barrel
│           ├── fields.ts            # Field metadata + FieldsValidationSchema (Zod)
│           └── dataPoints.ts        # DataPointDefinition record (or datapoints.ts — pick one)
├── webhooks/                       # OPTIONAL
│   ├── index.ts                    # export const webhooks = [...]
│   └── <webhookKey>/
│       ├── index.ts
│       ├── <webhookKey>.ts
│       ├── types.ts                # webhook payload type
│       ├── README.md               # optional but seen in bland/calDotCom/medplum
│       └── <webhookKey>.test.ts
├── lib/  OR  common/  OR  api/     # OPTIONAL: vendor SDK wrapper / validate-and-create helper
└── __mocks__/                      # OPTIONAL: test mocks
```

Scaffold a fresh extension with:

```bash
yarn generate-extension
```

It creates the layout above and registers the extension in `extensions/index.ts`.

---

## 2. The `Extension` manifest (`index.ts`)

```ts
import { type Extension, Category, AuthorType } from '@awell-health/extensions-core'
import { settings } from './settings'
import * as actions from './actions'            // OR: import { actions } from './actions'
import { webhooks } from './webhooks'           // omit if none

export const MyExtension: Extension = {
  key: 'myExtension',                            // unique camelCase slug
  title: 'My Extension',
  description: 'One-line description for the marketplace.',
  icon_url: 'https://res.cloudinary.com/...',   // hosted icon
  category: Category.COMMUNICATION,              // pick from Category enum
  author: { authorType: AuthorType.AWELL },      // or { authorType: AuthorType.EXTERNAL, authorName: 'Vendor' }
  settings,
  actions,                                       // Record<string, Action>
  webhooks,                                      // optional Webhook[]
  // identifier?: { system: 'https://vendor.com/' }  // set for EHRs that expose a stable patient ID system
  // timers?: [...]                                    // only if you implement async action completion via timer
}
```

Register it in `extensions/index.ts`:

```ts
import { MyExtension } from './myExtension'
export const extensions = [ /* ... */, MyExtension ]
```

---

## 3. Settings (`settings.ts`)

```ts
import { type Setting } from '@awell-health/extensions-core'
import { z } from 'zod'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    obfuscated: true,                  // true for any secret
    required: true,
    description: 'Your vendor API key (found at ...).',
  },
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    required: false,
    description: 'Override the default base URL (for sandbox/testing).',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().min(1, { message: 'API key is required' }),
  baseUrl: z.string().url().optional(),
})
```

Conventions:
- One setting per credential or per-tenant config value (API key, account SID, OAuth client_id/secret, base URL, mode toggle).
- `obfuscated: true` for secrets. The Studio will mask them.
- Multi-line secrets (e.g. RSA private keys) are passed as single-line strings with literal `\n`; transform in Zod: `z.string().transform(constructPrivateKey)` (see `extensions/epic`).
- Optional settings → `.optional()` in Zod.

---

## 4. Actions

### 4.1 Field metadata + Zod (`config/fields.ts`)

```ts
import { type Field, FieldType, StringType } from '@awell-health/extensions-core'
import { z } from 'zod'

export const fields = {
  recipient: {
    id: 'recipient',                       // MUST equal the object key (CI-enforced)
    label: 'Recipient phone',
    description: 'E.164 format, e.g. +14155550123',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message body',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  recipient: z.string().min(1),
  message: z.string().min(1),
})
```

`FieldType` enum: `STRING | TEXT | BOOLEAN | DATE | NUMERIC | NUMERIC_ARRAY | STRING_ARRAY | JSON | HTML`
`StringType` enum: `EMAIL | TEXT | URL | PHONE`

For cross-field rules (e.g. "from-number must come from settings OR field"), use `z.object({...}).superRefine(...)`.

### 4.2 Data points (`config/dataPoints.ts`)

```ts
import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  messageId: { key: 'messageId', valueType: 'string' },
  responseJson: { key: 'responseJson', valueType: 'json' },
} satisfies Record<string, DataPointDefinition>

export type DataPoints = keyof typeof dataPoints
```

`valueType`: `'string' | 'number' | 'boolean' | 'json' | 'date' | 'telephone'`

At the `onComplete` boundary **all data point values are strings** — `JSON.stringify` objects, `.toString()` numbers/booleans.

### 4.3 Action handler (`<actionKey>.ts`)

**Preferred: `onEvent`**

```ts
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { z } from 'zod'
import { fields, FieldsValidationSchema } from './config/fields'
import { dataPoints, DataPoints } from './config/dataPoints'
import { settings, SettingsValidationSchema } from '../../settings'
import { MyVendorClient } from '../../lib/client'

export const sendMessage: Action<typeof fields, typeof settings, DataPoints> = {
  key: 'sendMessage',
  category: Category.COMMUNICATION,
  title: 'Send message',
  description: 'Send a message via Vendor.',
  fields,
  dataPoints,
  previewable: true,                       // false only if it cannot be run in preview
  // supports_automated_retries: true,     // only for safe-to-retry, idempotent actions
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      const { fields: input, settings: cfg } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const client = new MyVendorClient({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl })
      const res = await client.send({ to: input.recipient, body: input.message })

      await onComplete({
        data_points: { messageId: res.id },
        events: [
          { date: new Date().toISOString(), text: { en: `Sent message ${res.id} to ${input.recipient}` } },
        ],
      })
    } catch (err) {
      if (err instanceof MyVendorError) {
        await onError({
          events: [{
            date: new Date().toISOString(),
            text: { en: err.message },
            error: { category: 'SERVER_ERROR', message: err.message },
          }],
        })
        return
      }
      // ZodError / unknown — re-throw so extensions-core's default handler deals with it
      throw err
    }
  },
}
```

**Handler signature reference:**

| Hook | Status | Signature |
|------|--------|-----------|
| `onEvent` | preferred | `({ payload, onComplete, onError, helpers, attempt }) => Promise<void>` |
| `onActivityCreated` | deprecated | `(payload, onComplete, onError) => Promise<void>` |

- `helpers` exposes `helpers.awellSdk()`, `helpers.log()`, `helpers.rateLimiter` (for webhooks).
- `onComplete({ data_points?, events? })` — both optional.
- `onError({ events: ActivityEvent[] })` — every event has `{ date, text: { en }, error?: { category, message } }`. Categories seen in the wild: `WRONG_INPUT`, `BAD_REQUEST`, `SERVER_ERROR`.
- If you `throw` instead of calling `onError`, extensions-core's default error handler will catch it. Common pattern: catch *known* vendor errors → `onError`; rethrow the rest.

### 4.4 Stakeholder-actionable (Hosted Pages) actions

For actions where a stakeholder interacts with a vendor UI (embedded signing, booking widget):

```ts
options: { stakeholders: { label: 'Stakeholder', mode: 'single' } },
previewable: false,
```

The handler typically only validates inputs and stores a URL field — **no API call** — and the Awell Hosted Pages component renders the UI. See `extensions/docuSign/actions/embeddedSigning`, `extensions/dropboxSign/v1/actions/embeddedSigning`, `extensions/calDotCom/actions/bookAppointment`.

### 4.5 Async action completion via webhook

Pattern (from `extensions/bland`):

1. Action exposes `webhook: string` field and `completeExtensionActivityAsync: boolean` field.
2. Action passes `${webhook}?activity_id=${payload.activity.id}` to the vendor as the callback URL.
3. Action returns **without** calling `onComplete` when async.
4. The webhook handler later resolves the activity via `onSuccess`.

---

## 5. Webhooks

### 5.1 Webhook handler (`webhooks/<key>.ts`)

**Preferred: `onEvent`**

```ts
import { type Webhook } from '@awell-health/extensions-core'
import { dataPoints } from './dataPoints'      // or co-located
import type { VendorWebhookPayload } from './types'

export const messageReceived: Webhook<keyof typeof dataPoints, VendorWebhookPayload, typeof settings> = {
  key: 'messageReceived',
  dataPoints,
  onEvent: async ({ payload: { payload, rawBody, headers, settings }, onSuccess, onError }) => {
    const messageId = payload?.id
    if (!messageId) {
      await onError({ response: { statusCode: 400, message: 'Missing id in payload' } })
      return
    }
    await onSuccess({
      data_points: {
        messageId: String(messageId),
        payload: JSON.stringify(payload),
      },
      patient_id: payload.metadata?.awell_patient_id,           // legacy
      // OR preferred for EHRs:
      // patient_identifier: { system: 'https://vendor.com/', value: payload.patient_id },
    })
  },
}
```

**Handler signature reference:**

| Hook | Status | Signature |
|------|--------|-----------|
| `onEvent` | preferred | `({ payload: { payload, rawBody, headers, settings }, onSuccess, onError, helpers }) => Promise<void>` |
| `onWebhookReceived` | deprecated | `({ payload, rawBody, headers, settings }, onSuccess, onError) => Promise<void>` |

- `onSuccess({ data_points, patient_id?, patient_identifier?, events?, response? })`
- `onError({ response: { statusCode, message }, events? })` — empty `onError({})` yields an automatic HTTP 400.
- `rawBody` + `headers` are available for HMAC signature verification. **No existing extension in the repo currently verifies signatures** — if the vendor documents a signature scheme, this is a gap worth filling for new work.

### 5.2 Register webhooks

```ts
// webhooks/index.ts
import { messageReceived } from './messageReceived'
export const webhooks = [messageReceived]
```

And add `webhooks` to the `Extension` object in `index.ts`.

---

## 6. Vendor API client patterns

Pick the pattern that matches the vendor:

### 6.1 Official SDK + thin wrapper (Slack, Twilio, Stripe, SendGrid, DocuSign, DropboxSign)

```ts
// lib/client.ts
import WebClient from 'vendor-sdk'
export class MyVendorClient {
  private client: WebClient
  constructor({ apiKey }: { apiKey: string }) { this.client = new WebClient(apiKey) }
  async send(args: SendArgs) { return this.client.messages.create(args) }
}
```

For mocking, re-export the SDK from `common/sdk/vendorSdk.ts` and `jest.mock` that path.

### 6.2 Custom axios client (Bland, Metriport-style)

Use when no good SDK exists or you want full control:

```ts
// api/client.ts
import axios, { AxiosInstance } from 'axios'
import { SendCallInputSchema } from './schema/SendCall.schema'

export class VendorApiClient {
  private http: AxiosInstance
  constructor(apiKey: string, baseUrl = 'https://api.vendor.com') {
    this.http = axios.create({ baseURL: baseUrl, headers: { Authorization: `Bearer ${apiKey}` } })
  }
  async sendCall(input: unknown) {
    const body = SendCallInputSchema.parse(input)   // Zod-validate outbound
    const { data } = await this.http.post('/calls', body)
    return data
  }
}
```

Mirror vendor request/response shapes as Zod schemas in `api/schema/`. Use `.passthrough()` on input schemas for forward-compat with vendor-added fields.

### 6.3 OAuth2 client-credentials REST (Athena, Elation)

Use `extensions-core` base classes:

```ts
// api/client.ts
import { APIClient, DataWrapper, OAuthClientCredentials } from '@awell-health/extensions-core'
import cache from 'memory-cache'

class VendorDataWrapper extends DataWrapper {
  async getPatient(id: string) { return this.Request<VendorPatient>('GET', `/patients/${id}`) }
}

export class VendorApiClient extends APIClient<VendorDataWrapper> {
  constructor({ authUrl, baseUrl, clientId, clientSecret }) {
    super({
      baseUrl,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: { data: { grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret } },
        cacheService: cache,
      }),
    })
  }
  async getPatient(id: string) { return this.FetchData(dw => dw.getPatient(id)) }
}
```

### 6.4 FHIR R4 (Epic, Medplum)

Use `@medplum/fhirtypes` for resource shapes; build typed Zod schemas per operation in `lib/api/FhirR4/schema/`. SMART Backend Services auth (Epic) = RS384-signed JWT → `client_credentials` exchange.

### 6.5 GraphQL (Healthie)

Use `graphql-request` directly, or a codegen SDK (`@graphql-codegen`). Auth typically `Authorization: Basic <apiKey>`. Map GraphQL `messages[]` errors to `ActivityEvent`s.

### 6.6 Shared "validate-and-create-sdk" helper

When multiple actions use the same client, centralise:

```ts
// lib/validatePayloadAndCreateSdk.ts
import { validate } from '@awell-health/extensions-core'
import { z } from 'zod'
import { SettingsValidationSchema, settings } from '../settings'

export const validatePayloadAndCreateSdk = async ({ fieldsSchema, payload }) => {
  const { fields, settings: cfg, patient, pathway, activity } = validate({
    schema: z.object({ fields: fieldsSchema, settings: SettingsValidationSchema }),
    payload,
  })
  const sdk = new VendorClient(cfg)
  return { sdk, fields, settings: cfg, patient, pathway, activity }
}
```

This is the **most common pattern** in mature extensions (HubSpot, Stripe, Healthie, Bland, Cal.com v2, Medplum, Athena). Default to it.

---

## 7. Error handling — decision tree + taxonomy

The framework's `ActivityEvent.error.category` maps to a four-way taxonomy. Use the right category — it controls whether the Awell platform retries, surfaces to the care flow designer as a config bug, or treats it as a transient outage.

| Category | Meaning | Retryable? | `supports_automated_retries`? | Example |
|----------|---------|-----------|--------------------------------|---------|
| `WRONG_INPUT` | Validation error — user-supplied field values failed Zod | **No** | No | Missing required field, malformed phone, invalid enum |
| `BAD_REQUEST` | Business logic rejection from vendor (4xx) | **No** | No | 409 duplicate patient, 422 unprocessable entity, "email already exists" |
| `SERVER_ERROR` | Transient/vendor outage (5xx, network, timeout) | **Yes** | **Yes** (set `supports_automated_retries: true`) | 500, 502, ECONNRESET, Axios timeout |
| (permission — use `BAD_REQUEST`) | 401/403 — auth/permission | **No** | No | Bad API key, missing scopes |

> **Distinguish "access failure" from "valid empty result."** A successful API call returning zero matches is `onComplete({ data_points: { ... } })` with empty values — NOT `onError`. `onError` is for failures; empty results are successful negative answers.

### Decision tree

```
catch (err):
  if err instanceof ZodError:
    onError({ events: [{ date, text: { en: fromZodError(err).message }, error: { category: 'WRONG_INPUT', message } }] })
    return
  if err is AxiosError / vendor typed error:
    if status is 4xx (not 408/429):
      category = 'BAD_REQUEST'
    else (5xx, network, timeout, 429):
      category = 'SERVER_ERROR'
    map to ActivityEvent with that category
    onError({ events: [...] })
    return
  // unknown — let extensions-core handle:
  throw err
```

### Retryability rules

- Set `supports_automated_retries: true` on the `Action` only when the action is **idempotent** AND the failure mode is **transient** (5xx/network). A `createPatient` that 500s might or might not have created the patient on the vendor side — only mark retryable if the vendor supports idempotency keys or a `If-None-Exist` search-then-create pattern (see `extensions/medplum/actions/createResource`).
- Never set retryable for `WRONG_INPUT` / `BAD_REQUEST` — retrying won't change the outcome.

Some extensions (Stripe, simple reads) skip explicit `try/catch` and let all errors bubble — acceptable for trivial actions. For anything user-facing, catch and map. Mirror existing helpers (`isTwilioErrorResponse`, `mapSendgridErrorsToActivityErrors`, `mapHealthieToActivityError`) — create `lib/errors.ts` with `isVendorErrorResponse` + `mapVendorErrorToActivityEvent` for the new vendor.

---

## 8. Testing

- Co-locate `<file>.test.ts` next to the implementation.
- Use `TestHelpers.fromAction(action)` / `TestHelpers.fromWebhook(webhook)` to get `{ onComplete, onError, helpers, extensionAction }`.
- Mock the vendor SDK via `__mocks__/` or `jest.mock('../../lib/client')`.
- Fixtures in `__testdata__/` (webhooks) or inline.
- Iterate on your new test with **`yarn test-file <action-or-file-name>`** (scoped). Do **not** run `yarn test <path>` — the trailing `--testPathIgnorePatterns` swallows the path and runs the whole suite instead (see the testing skill). Run the full `yarn test` only as the final pre-PR gate.

---

## 8.5 Verify at runtime with the CLI (`yarn cli`)

`yarn test` proves your code behaves against **mocks**; it does **not** prove the extension actually runs. After `yarn build`, close the loop with the CLI — execute the real handler and observe actual `data_points`/`events`. The full runtime-testing workflow (discover keys with `list`/`describe`, run with `run`/`webhook replay`, and interpret the structured `error` object) lives in the **`testing-awell-extensions` skill** (`TESTING.md`) — use it rather than duplicating those steps here.

Minimum loop when finishing an extension (detail in the testing skill):

```bash
yarn cli list                                     # confirm registration + real keys
yarn cli describe <ext>/<action>                  # real fields + settings status
yarn cli doctor <ext>                              # credentials present?
yarn cli run <ext>/<action> --fields '…' --json    # execute; read status/data_points/events/error
```

---

## 9. README + CHANGELOG

`README.md` must have YAML frontmatter and contain:

```markdown
---
title: Vendor
description: Send messages and manage contacts via Vendor.
---

# Vendor

## Setup
- API key (from https://app.vendor.com/settings/api)
- Optional base URL for sandbox

## Actions
### Send message
Sends a message via Vendor.

**Inputs:** recipient (phone), message (text)
**Data points:** messageId
```

`CHANGELOG.md` follows Keep-a-Changelog-style semver entries. Both files are CI-enforced to be non-empty and are bundled into `dist/extensions/markdown.json` at build time.

---

## 10. Build & registration checklist

- [ ] `yarn generate-extension` created the scaffold (or you created it manually per §1)
- [ ] `index.ts` exports a typed `Extension` object
- [ ] Registered in `extensions/index.ts` (scaffold does this automatically)
- [ ] `settings.ts` has `settings` + `SettingsValidationSchema`
- [ ] Each action has `config/fields.ts` (with `FieldsValidationSchema`) and `config/dataPoints.ts`
- [ ] Every `Field.id` equals its object key
- [ ] Handler uses `onEvent` (preferred)
- [ ] Vendor client wrapped in `lib/` / `api/` / `common/`; shared via `validatePayloadAndCreateSdk` when ≥2 actions use it
- [ ] Errors mapped to `ActivityEvent` with correct `category`
- [ ] `README.md` (frontmatter + setup + per-action docs) and `CHANGELOG.md` written
- [ ] Tests co-located, mocks in place
- [ ] `yarn build` succeeds
- [ ] `yarn test` succeeds
- [ ] Registered extension appears in `yarn cli list` with the expected action/webhook keys
- [ ] Smoke-tested at runtime with `yarn cli run <ext>/<action>` (real handler execution, not just mocks); webhooks exercised with `yarn cli webhook replay`
- [ ] Branch + PR conventions in [`PR-CONVENTIONS.md`](./PR-CONVENTIONS.md) followed (branch name, PR title `type(scope): imperative`, body has `## Summary` + `## Test plan`, **no manual `package.json` version bump**)

---

## 11. End-to-end workflow for an agent given API docs

When a user says *"build me an Awell extension for Vendor X that does Y"* and provides API docs:

### Step 0 — Produce a structured plan BEFORE writing any code

Output a JSON object (or markdown block with these exact sections) and confirm with the user before scaffolding. This eliminates the "built the wrong thing" failure mode — schemas fix syntax errors, but only a plan-review fixes semantic misalignment.

```json
{
  "vendor": { "name": "...", "api_type": "REST|GraphQL|FHIR", "docs_url": "..." },
  "auth": { "scheme": "api_key|oauth_client_credentials|oauth_password|jwt_bearer|http_basic",
            "settings_required": ["apiKey", ...] },
  "client_pattern": "§6.1|§6.2|§6.3|§6.4|§6.5",
  "template_extension": "extensions/<closest analogue>",
  "actions": [
    { "key": "camelCase", "title": "...", "fields": [{"id":"...","type":"STRING|...","required":true}],
      "data_points": [{"key":"...","valueType":"string|json|..."}],
      "previewable": true, "supports_automated_retries": false,
      "is_async_with_webhook": false }
  ],
  "webhooks": [
    { "key": "...", "patient_linking": "patient_id|patient_identifier", "signature_verification": "vendor documents scheme? implement it." }
  ],
  "open_questions": ["..."]
}
```

Rules:
- Mark fields **nullable/optional** in the plan when the vendor docs say a field is optional — this prevents the model from fabricating values when an upstream agent later fills the plan in.
- Use `"unclear"` (not a guess) for anything ambiguous; surface in `open_questions` and ask the user.
- Do not proceed to scaffolding until the user confirms the plan.

### Step 1 — Classify the vendor API

REST? GraphQL? FHIR? Auth scheme? → use the **decision matrix in §0.1** to pick the client pattern and template extension. Do not read more of this file than the matrix needs.

### Step 2 — Survey existing extensions (delegation pattern)

If you have subagent capabilities, delegate the survey in parallel — one subagent per candidate template extension — and pass each subagent the **complete context** it needs (the plan from Step 0, the relevant section of this skill, the specific extension folder to read). Subagents have isolated context; they will not inherit your conversation history.

- **Hub-and-spoke:** you are the coordinator. Subagents report back to you; they do not talk to each other.
- **Scope partitioning:** assign each subagent a distinct extension (or distinct concern: settings vs actions vs webhooks vs client) — do not have two subagents analyse the same thing.
- **Parallelise:** emit all subagent calls in a single response, not sequentially.
- **Provenance:** require each subagent to return file paths + code snippets + which extension each pattern was borrowed from. This survives your synthesis step.

If you cannot delegate, read the template extension identified in §0.1 directly. Use `Read`/`Grep` — don't `cat`/`head`/`tail`.

### Step 3 — Decide settings

What per-tenant config does the org need to provide? (credentials, base URL, mode toggle, default from-address, etc.) One `Setting` per credential or per-tenant config value.

### Step 4 — Decide actions

Translate the user's intent to one or more `Action`s. For each: list fields (with types), data points, category, `previewable`, retry safety (`supports_automated_retries`).

### Step 5 — Decide webhooks

Does the vendor push events that an Awell care flow should react to? If yes, list them, define payload types, decide patient-linking strategy (`patient_id` vs `patient_identifier`). **If the vendor documents a webhook signature scheme, implement verification** using `rawBody` + `headers` — this is a gap in current extensions; do not copy the "trust the payload" behaviour by default.

### Step 6 — Scaffold

`yarn generate-extension` (or add to an existing extension if one already exists for this vendor — search `extensions/index.ts` first).

### Step 7 — Implement in dependency order

settings → client helper (`validatePayloadAndCreateSdk`) → action handlers → webhooks. Reuse `validatePayloadAndCreateSdk` whenever ≥2 actions share a client.

### Step 8 — Map vendor errors

Build `lib/errors.ts` with `isVendorErrorResponse` + `mapVendorErrorToActivityEvent`, mapping to the four categories in §7.

### Step 9 — Write tests

Co-locate `<file>.test.ts` using `TestHelpers.fromAction` / `fromWebhook`. Mock the client via `__mocks__/`.

### Step 10 — Write `README.md` + `CHANGELOG.md`

Frontmatter + setup + per-action docs (condensed from vendor docs — do not copy wholesale). Add a `CHANGELOG.md` entry.

### Step 11 — Register + build + test + **run** (close the loop)

Register in `extensions/index.ts` if the scaffold didn't. Run `yarn build && yarn test`. Fix lints/tests.

Then verify at **runtime** — static checks and mocked tests do not prove it runs. **Switch to the `testing-awell-extensions` skill** (`TESTING.md`) to close the loop: `yarn cli list` (registered as planned?) → `yarn cli describe <ext>/<action>` (fields/settings) → `yarn cli doctor <ext>` (credentials) → `yarn cli run …` / `webhook replay` (execute the real handler, read `status`/`data_points`/`events`/`error`).

Feed any runtime failure back into the **validation-retry loop** below, exactly like a build/test failure.

### Step 12 — Self-review against the checklist in §10, then open a PR

**Branch + PR title + PR body conventions live in the `pr-conventions` skill ([`PR-CONVENTIONS.md`](./PR-CONVENTIONS.md)).** Switch to it when creating the branch and PR. Quick version: branch `feat/<extensionKey>-<short-desc>` or `fix/<extensionKey>-<short-desc>`; PR title `feat(<extensionKey>): <imperative description>`; body has `## Summary` + `## Test plan`; open against `main`; do NOT bump `package.json` version (CI auto-bumps on merge).

### Validation-retry loop (apply to your own work)

If `yarn build`, `yarn test`, or a `yarn cli run`/`webhook replay` (§8.5) fails, treat the failure as a structured error signal: re-read the original plan from Step 0 + the specific compiler/jest/runtime error + the file that failed. Do not blindly patch — distinguish **fixable errors** (typo, missing import, wrong type) from **absent information** (vendor doc gap → re-read docs or ask user). Iterate until green.

### Common gotchas

- Don't create a per-extension `package.json`. Add deps to the **root** `package.json` only.
- Don't write a JSON manifest. The TS `Extension` object *is* the manifest.
- Don't call `onComplete` and `onError` in the same handler invocation.
- All `data_points` values must be **strings** at the callback boundary (`JSON.stringify` / `String()`).
- `Field.id` must equal its key in the `fields` record (CI-enforced).
- For secrets stored as single-line strings with `\n` (e.g. RSA keys), transform in Zod — don't assume real newlines.
- For embedded/stakeholder actions, the handler usually makes **no API call** — it just validates inputs and stores a URL. The actual UX happens in the Awell Hosted Pages component.
- Use `onEvent`, not `onActivityCreated`, for new code. Same for webhook `onEvent` vs `onWebhookReceived`.
- If the vendor supports webhook signature verification, implement it using `rawBody` + `headers` — this is a gap in current extensions and worth getting right.
- **Don't mirror the vendor's entire API.** Build only the action(s) the user asked for. A 30-action extension is a maintenance liability, not a feature.
- **Don't catch and silently swallow errors.** Either call `onError` with a mapped `ActivityEvent` or re-throw — never `catch {}` and return.
- **Don't fabricate data point values when the vendor response is missing fields.** Use `undefined` (omit the key) so downstream care-flow logic can branch on absence. This is the runtime equivalent of nullable schema fields.
- **Don't copy `onActivityCreated` from an older extension as your starting template** without first refactoring to `onEvent`. The deprecated signature lacks `helpers` (no `awellSdk`, no `rateLimiter`, no `log`).

---

## 12. Production reliability patterns (apply when extending or modifying)

These patterns matter most when an agent is **modifying an existing extension** or **synthesising findings across multiple extensions** — the contexts where context degradation and provenance loss bite.

### Persistent case facts (preserve across edits)

When editing an existing extension, the existing `key`, `title`, `description`, `icon_url`, and already-released `Setting` keys are **transactional facts**. Do not rename them — downstream Awell care flows reference them by key. Treat them as a persistent block:

```
EXISTING_EXTENSION_FACTS:
  key: <do not change>
  title: <do not change without user approval>
  existing_settings_keys: [<do not rename, only add new ones>]
  existing_action_keys: [<do not rename; deprecate instead>]
  existing_data_point_keys: [<downstream care flows read these — do not rename>]
```

Add new settings/actions/data points freely. Renaming an existing one is a breaking change requiring a major version bump and a `CHANGELOG` entry flagged `BREAKING`.

### Lost-in-the-middle mitigation

When aggregating findings from multiple subagents or multiple extension analyses, place a `## Key findings summary` block at the top of your synthesis, then detailed findings with explicit `## <extension name>` section headers below. Structural placement beats prompt-based reminders ("remember to consider..."). The decision matrix in §0.1 and the reference table in §14 follow this pattern.

### Provenance preservation

When borrowing a pattern from an existing extension, cite it inline (`# pattern from extensions/bland/lib/validatePayloadAndCreateSdk.ts`). This lets future maintainers — including future agents — trace why a decision was made. The reference table in §14 is the canonical map.

### Tool trimming when reading the repo

When surveying existing extensions for a pattern, do not `Read` entire extension folders. Use `Grep` for the specific symbol (e.g. `validatePayloadAndCreateSdk`, `OAuthClientCredentials`, `onEvent`) and `Read` only the matching file. This keeps your context budget for the actual implementation work.

### Prompt caching friendliness

This file is intentionally organised with stable reference content (§§1–10) before dynamic workflow content (§11+). If you cache the skill in your context, the cache prefix is stable across edits to the workflow section.

---

## 13. Quick reference — imports you'll need

```ts
// From the framework (resolved via root package.json)
import {
  type Extension, type Action, type Webhook,
  type Setting, type Field, type DataPointDefinition,
  type NewActivityPayload, type ActivityEvent,
  FieldType, StringType, Category, AuthorType,
  validate, fetchTyped,
  APIClient, DataWrapper, OAuthClientCredentials, OAuthPassword,
  DateTimeSchema, NumericIdSchema, E164PhoneValidationSchema, makeStringOptional,
  TestHelpers,
} from '@awell-health/extensions-core'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

// Shared repo helpers (use sparingly; only if the action needs Awell care-flow state)
import { addActivityEventLog } from '../../src/lib/awell/addEventLog'
import { getLatestFormInCurrentStep } from '../../src/lib/awell'
import { getEmailValidation } from '../../src/utils/emailValidation'
```

---

## 14. Reference examples by scenario

| You need to... | Look at |
|----------------|---------|
| Wrap an official vendor SDK | `extensions/slack`, `extensions/twilio`, `extensions/stripe`, `extensions/sendgrid-extension` |
| Build a custom axios client | `extensions/bland`, `extensions/metriport` |
| OAuth2 client credentials | `extensions/athenahealth`, `extensions/elation` |
| FHIR R4 | `extensions/epic`, `extensions/medplum` |
| GraphQL | `extensions/healthie` |
| Receive webhooks | `extensions/bland/webhooks/CallCompleted`, `extensions/medplum/webhooks/ObservationCreated`, `extensions/calDotCom/webhooks` |
| Async action → webhook completion | `extensions/bland` |
| Stakeholder-actionable embedded UI | `extensions/docuSign/actions/embeddedSigning`, `extensions/dropboxSign/v1/actions/embeddedSigning`, `extensions/calDotCom/actions/bookAppointment` |
| Polling / async job status | `extensions/sendgrid-extension/v1/actions/importStatus`, `extensions/metriport` consolidated query |
| LLM-powered action | `extensions/elation` (`findAppointmentsWithAI`) |
| Pagination | `extensions/twilio/v2/actions/getMessages` |
| Rate-limited webhooks | `extensions/elation/webhooks` (`helpers.rateLimiter`) |
| Patient linking via identifier system | `extensions/medplum`, `extensions/elation`, `extensions/healthie` |
