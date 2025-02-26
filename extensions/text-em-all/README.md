---
title: Text-Em-All
description: Text-Em-All is a texting and automated calling service that enables organizations to communicate with patients.
---

# Text-Em-All

Text-Em-All is a texting and automated calling service that enables organizations to communicate with patients.

## Introduction

### Integration landscape

Text-Em-All provides REST APIs for integration.

1. **Messaging**: Send text messages and make voice calls to contacts.


### The Text-Em-All extension

The **Text-Em-All Extension** is designed to support server-to-server (backend) integrations with Text-Em-All's REST API. This enables automated messaging and calling capabilities within your Awell workflows without requiring direct user interaction.

The extension supports the following core functionalities:
- SMS Broadcast

## Setup

The Text-Em-All extension requires the following settings to be configured:

| Setting name | Required | Description |
|--------------|----------|-------------|
| `customerKey` | Yes | Your Text-Em-All customer key |
| `customerSecret` | Yes | Your Text-Em-All customer secret |
| `token` | Yes | Your Text-Em-All token |
| `baseUrl` | Yes | Your Text-Em-All base URL |

## Actions

### Send SMS Broadcast

Send a text message to a single recipient. Required fields include:
- Phone number
- Message content

The action will return a message ID for tracking purposes.

### Webhooks

## Broadcast Status Change

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

# Find out more

For detailed information about setting up webhooks, notification formats, and additional event types, please visit the [Text-Em-All Webhooks documentation](https://dev.text-em-all.com/Webhooks#events).