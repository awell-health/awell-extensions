---
title: Zendesk
description: Zendesk is a customer service and support platform that provides a suite of tools and software for businesses to manage their customer interactions.
---

# Zendesk

Zendesk is a customer service and support platform that provides a suite of tools and software for businesses to manage their customer interactions. It offers a range of customer service solutions, including help desk ticketing systems, customer support and engagement, and self-service options.

## Extension settings (Support)

This extension uses the Zendesk Support API. Configure the following settings:
- Support subdomain (e.g. "acme" for acme.zendesk.com)
- Support agent email (the agent email associated with the API token)
- Support API token

## Custom Actions

### Create ticket

Creates a Zendesk Support ticket using Basic auth with email/token and API token:
- Maps requester email/name
- Includes subject and comment body
- Supports optional external_id and tag (sent as a single tag in the tags array)
