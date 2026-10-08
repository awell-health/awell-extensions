# Changelog

All notable changes to this project will be documented in this file.

## [1.2.1] - 2026-10-07

### Fixed

- "Update Ticket" rejected the ticket ID with `expected string` when the field was bound to a number data point. The field is numeric in Studio, so it now uses the same `NumericIdSchema` as "Get Ticket" and "Delete Ticket" and accepts both numbers and numeric strings.

## [1.2.0] - 2026-09-23

### Added

- OAuth client credentials authentication (new optional settings "OAuth Client Identifier" and "OAuth Client Secret"). Zendesk is removing API tokens: accounts created on or after 2026-07-28 cannot create them and all tokens stop working on 2027-04-30. Access tokens are fetched with the client credentials grant through the extensions-core `OAuthClientCredentials`/`APIClient` classes, which cache them until they expire.
- Ticket event webhook now falls back to the request body when the ticket cannot be fetched from the Zendesk API (missing or invalid credentials, API unavailable). A ticket that Zendesk reports as not found still responds `404` without starting a care flow. New `ticketFetched` data point indicates which path was taken; the trigger body contract gained optional well-known keys (subject, status, priority, tags, external_id, requester_name, requester_email, ...).

### Changed

- "User Email" and "API Token" settings are now optional (legacy) and only required when the OAuth settings are empty.
- The "Zendesk Subdomain" setting accepts a pasted host (`company.zendesk.com`, `https://company.zendesk.com/`) and is normalised to the subdomain. Values that are not a single DNS label are rejected, so credentials can only be sent to a `*.zendesk.com` host.
- API calls now go through the extensions-core `APIClient`, which retries a failed call once after 250ms (and, on a 401, fetches a fresh OAuth token first). **Known limitation:** this also applies to "Create Ticket", so a request that Zendesk processed but whose response was lost (for example a timeout) can create a duplicate ticket. Sending a Zendesk `Idempotency-Key` would prevent this and is not done yet.

## [1.1.0] - 2026-09-16

### Added

- Ticket event webhook. Accepts a webhook connected to a Zendesk trigger or automation (JSON body with `ticket_id`) as well as a webhook subscribed to Zendesk ticket events (`zen:event-type:ticket.*`). Fetches the full ticket, including the requester's name and email, and exposes it as data points.
- Get Ticket action, returning the ticket fields, requester details, tags, custom fields and the full ticket as JSON.

## [1.0.0] - 2025-01-10

### Added

- Initial release of Zendesk Support extension
- Create Ticket action with OAuth authentication
- Support for all major ticket fields: subject, comment, group_id, priority, external_id, tags
