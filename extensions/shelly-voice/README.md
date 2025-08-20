# Shelly Voice (LiveKit) Extension

Shelly Voice provides a lightweight wrapper around LiveKit to create, start, and stop voice AI agents from Awell. It also ships a minimal webapp for local testing and configuration.

## Settings
- livekitServerUrl: LiveKit server URL.
- livekitApiKey: LiveKit API key.
- livekitApiSecret: LiveKit API secret.
- defaultVoice: Optional default voice.
- defaultLanguage: Optional default language.

## Actions
- createAgent
  - Fields: voice, language, personality
  - DataPoints: agentId, config, createdAt
- startAgent
  - Fields: agentId, sessionContext (JSON)
  - DataPoints: sessionId, status, startedAt
- stopAgent
  - Fields: agentId
  - DataPoints: status, stoppedAt

## Webhooks
- sessionEvents
  - DataPoints: eventType, sessionId, agentId, timestamp, details

## Local Webapp
Located at `extensions/shelly-voice/webapp`. It contains a Node backend and React single-page UI for:
- Creating an agent with voice, language, and personality
- Starting and stopping the agent
- Viewing status and event logs

The backend keeps an in-memory store for agents and sessions suitable for local development.

### Run locally
1. From repo root, run:
   - yarn build
   - yarn test
2. Webapp:
   - Backend:
     - cd extensions/shelly-voice/webapp/server
     - cp .env.example .env and set LIVEKIT variables
     - yarn && yarn dev
   - Frontend:
     - cd ../client
     - cp .env.example .env and set VITE_API_URL
     - yarn && yarn dev

### Add new voices/personalities
- Update validation options or UI select lists in the webapp client.
- No code changes are required in actions; values are passed through to LiveKit via the wrapper.

This extension uses in-memory storage for agents and sessions for demonstration purposes.
