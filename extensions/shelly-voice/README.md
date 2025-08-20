# Shelly Voice (LiveKit-based Awell Extension)

A lightweight web UI + Node backend that functions as an Awell Extension to configure, deploy, start, and stop LiveKit voice AI agents. Includes a clean wrapper API and integrates with Awell’s orchestration model by exposing agent session events as webhook outputs.

## Features
- Create agents with voice, language, personality, and healthcare JTBD inputs
- Start/stop agent sessions and view status
- Event panel listing lifecycle events
- Webhook endpoint to forward LiveKit events to Awell (optional)

## JTBD-style inputs (healthcare)
The Create Agent form and action config include these fields:
- voice (string)
- language (string)
- personality (string)
- jobToBeDone (string) – e.g., Intake call, Pre-op instructions, Care plan review
- patientContext (text) – e.g., age, language preferences, diagnoses, clinical notes
- careSetting (enum) – inpatient | outpatient | virtual
- complianceNotes (text) – e.g., HIPAA considerations, consent/recording flags

These are persisted into the agent’s config when created and can inform downstream orchestration.

## Repo structure
- extensions/shelly-voice
  - lib/livekitClient.ts – thin wrapper; in-memory demo of agents/sessions
  - actions/
    - createAgent
    - startAgent
    - stopAgent
  - webhooks/
    - sessionEvents – forwards incoming LiveKit events to Awell (optional)
  - webapp/ – local SPA for testing (excluded from monorepo build)
    - server/ – Express API adapter
    - client/ – React + Vite SPA

## Local development
Server:
- cd extensions/shelly-voice/webapp/server
- cp .env.example .env and set:
  - PORT=5057
  - LIVEKIT_URL=wss://shelly-voice-<env>.livekit.cloud
  - LIVEKIT_API_KEY=…
  - LIVEKIT_API_SECRET=…
  - AWELL_WEBHOOK_URL= optional; if set, server forwards events to this URL
  - CLIENT_ORIGIN=http://localhost:5173 (or your tunnel URL)
- yarn && yarn dev

Client:
- cd extensions/shelly-voice/webapp/client
- cp .env.example .env and set:
  - VITE_API_URL=http://localhost:5057/api (or your server tunnel URL)
  - ALLOWED_HOST=<your-tunnel-host>
- yarn && yarn dev --host

Notes for tunnels and auth:
- Do not embed credentials in VITE_API_URL. If your API tunnel is basic-auth protected, set VITE_API_BASIC_AUTH to user:password and keep VITE_API_URL clean (e.g. https://your-api-host/api). The client will send the Authorization header automatically.
- vite.config.ts uses server.allowedHosts with ALLOWED_HOST. Set this to your public host when exposing the client.
- The server CORS uses CLIENT_ORIGIN to allow the client origin.

## Wrapper API
- createAgent(config) → { agentId, config }
- startAgent(settings, agentId, context) → { sessionId, status, context }
- stopAgent(settings, agentId) → { status }

## HTTP API (server)
- POST /api/agents – body includes voice, language, personality, and JTBD fields
- POST /api/agents/:id/start – body { sessionContext?: {...} }
- POST /api/agents/:id/stop
- GET /api/events – returns in-memory event log
- POST /api/webhooks/livekit – ingests and optionally forwards events to AWELL_WEBHOOK_URL

## Awell Integration
- The Shelly Voice actions expose JTBD inputs in the action configs.
- The webhook endpoint surfaces LiveKit session events which can be consumed in CareFlows.

## Extending voices/personalities
- UI: update SPA inputs in webapp/client/src/App.tsx (options or free-form).
- Actions: update fields validation in actions/createAgent/config/fields.ts.
- Wrapper: extend AgentConfig in lib/livekitClient.ts if storing additional config.

## Testing
- Unit tests cover lifecycle and JTBD persistence:
  - extensions/shelly-voice/__tests__/livekitClient.test.ts

## Security
- Do not commit LiveKit secrets.
- Use environment variables for LIVEKIT_API_KEY and LIVEKIT_API_SECRET.
