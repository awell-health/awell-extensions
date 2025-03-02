---
title: Text-Em-All
description: Text-Em-All is a texting and automated calling service that enables organizations to communicate with patients.
---

# Text-Em-All

Text-Em-All is a texting and automated calling service that enables organizations to communicate with patients.

## Supported Actions

- **sendSMSBroadcast** - Schedule SMS message to a specified user
- **sendCallBroadcast** - Schedule an Call message to a specified user

## Webhooks

# Broadcast Status Change

Triggered when the status of a call or text broadcast changes to one of the following states:

| Status | Description |
|--------|-------------|
| `created` | A broadcast has been created on your Call-Em-All account. It may be scheduled to run in the future and it may not have all the information set up to run yet. |
| `ready` | The broadcast has all information necessary to run and is waiting for its start time. |
| `broadcasting` | The broadcast started to send out phone calls or text messages. |
| `completed` | The broadcast has finished sending out all phone calls or text messages. |
| `paused` | The broadcast has been paused and no calls or texts are going out. |
| `resumed` | A paused broadcast resumes. |
| `canceled` | The broadcast was canceled. |
| `expired` | The window that was set up for the broadcast by the user was insufficient to send out all the calls or texts. The broadcast has been expired and some of the calls and texts are not delivered. |

Webhook includes:
- Broadcast ID
- Broadcast status

## Setup

The Text-Em-All extension requires the following settings to be configured:

| Setting name | Required | Description |
|--------------|----------|-------------|
| `customerKey` | Yes | Your Text-Em-All customer key |
| `customerSecret` | Yes | Your Text-Em-All customer secret |
| `token` | Yes | Your Text-Em-All token |
| `baseUrl` | Yes | Your Text-Em-All base URL |

# Find out more

For detailed information about setting up webhooks, notification formats, and additional event types, please visit the [Text-Em-All Webhooks documentation](https://dev.text-em-all.com/Webhooks#events).