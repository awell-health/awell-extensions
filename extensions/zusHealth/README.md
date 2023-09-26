---
title: ZUS Health
description: Zus is the only shared health data platform designed to accelerate healthcare data interoperability by providing easy-to-use patient data at the point of care via API, embedded components, and direct EHR integrations.
---

# ZUS Health

[ZUS Health](https://zushealth.com/) is the only shared health data platform designed to accelerate healthcare data interoperability by providing easy-to-use patient data at the point of care via API, embedded components, and direct EHR integrations.

## ZUS Health x Awell

This extension allows you to fetch resource via webhooks

## Extension settings

For the extension to function correctly, you must include the following elements in your settings:

`client_id` and `client_secret`: These values are generated on the ZUS Health platform.
`base_url`: This determines the base URL for your FHIR endpoint, for example, https://api.sandbox.zusapi.com/fhir.
`auth_url`: This determines the base URL for your authorization endpoint, for example, https://zus-sandbox.us.auth0.com/oauth/token.
`audience`: This determines the API hostname, for example, https://api.sandbox.zusapi.com.

## Webhooks

Webhooks offer a great way to automate the flow with Awell when you want to fetch a resource.
