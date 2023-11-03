---
title: Calendly
description: Calendly is your scheduling automation platform for eliminating the back-and-forth emails to find the perfect time
---

# Calendly

[Calendly](https://calendly.com/) is the scheduling automation platform with team-based scheduling, solutions and integrations for every department, and advanced security features. Note that Calendly is not HIPAA-compliant, so is not endorsed by Awell. If you wish to use a HIPAA-compliant scheduling solution, we recommend using our Cal.com extension instead.

## Extension settings

In order to set up this extension, **you will need to provide a Calendly API key**. You can obtain an API key via the Calendly portal (`Settings > Developer > API keys`).

## Pricing

**This extension is free** but keep in mind that you might need a paid plan for Calendly depending on your needs.

## Webhooks

Webhooks offer a great way to automate the flow with Awell when invitees schedule, cancel, or reschedule events, or when the meeting ends.

**Important notes:**

1. An Awell webhook endpoint can only listen to one event type. So make sure that when you create a webhook in Calendly, the subscriber URL and the event trigger match the Awell webhook endpoint. This also means there can only be one event type per subscriber URL.
2. Using a secret to verify the authenticity of the received payload is not yet supported.
3. Custom payload templates are not supported, please use the default ones.
