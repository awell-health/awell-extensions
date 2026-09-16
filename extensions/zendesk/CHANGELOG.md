# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-09-16

### Added

- Ticket event webhook. Accepts a webhook connected to a Zendesk trigger or automation (JSON body with `ticket_id`) as well as a webhook subscribed to Zendesk ticket events (`zen:event-type:ticket.*`). Fetches the full ticket, including the requester's name and email, and exposes it as data points.
- Get Ticket action, returning the ticket fields, requester details, tags, custom fields and the full ticket as JSON.

## [1.0.0] - 2025-01-10

### Added

- Initial release of Zendesk Support extension
- Create Ticket action with OAuth authentication
- Support for all major ticket fields: subject, comment, group_id, priority, external_id, tags
