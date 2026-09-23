# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-09-23

### Added

- OAuth client credentials authentication (new optional settings "OAuth Client Identifier" and "OAuth Client Secret"). Zendesk is removing API tokens: accounts created on or after 2026-07-28 cannot create them and all tokens stop working on 2027-04-30. Access tokens are fetched with the client credentials grant and cached until shortly before they expire.
- Ticket event webhook now falls back to the request body when the ticket cannot be fetched from the Zendesk API (missing or invalid credentials, ticket not found, API unavailable). New `ticketFetched` data point indicates which path was taken; the trigger body contract gained optional well-known keys (subject, status, priority, tags, external_id, requester_name, requester_email, ...).

### Changed

- "User Email" and "API Token" settings are now optional (legacy) and only required when the OAuth settings are empty.
- The subdomain setting tolerates a full host being pasted (e.g. "company.zendesk.com" is normalised to "company").

## [1.1.0] - 2026-09-16

### Added

- Ticket event webhook. Accepts a webhook connected to a Zendesk trigger or automation (JSON body with `ticket_id`) as well as a webhook subscribed to Zendesk ticket events (`zen:event-type:ticket.*`). Fetches the full ticket, including the requester's name and email, and exposes it as data points.
- Get Ticket action, returning the ticket fields, requester details, tags, custom fields and the full ticket as JSON.

## [1.0.0] - 2025-01-10

### Added

- Initial release of Zendesk Support extension
- Create Ticket action with OAuth authentication
- Support for all major ticket fields: subject, comment, group_id, priority, external_id, tags
