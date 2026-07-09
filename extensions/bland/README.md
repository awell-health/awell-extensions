---
title: Bland.ai
description: To do
---

# Bland.ai

With Bland.ai you can build, test, and deploy AI phone calling agents. 

## Extension settings

To set up this extension, you will need to provide an API key for Bland.

## Actions

### Send call (with Pathway)

Initiates an AI phone call using a simple prompt or a conversational pathway agent built on the Bland platform. This action is asynchronous—it triggers a call request in Bland, which queues the call. Note that the action only confirms that Bland has received the request; it does not wait for the call to complete or handle any callbacks from Bland.

Awell lets you specify both the data you want to send to Bland and the structured data you’d like to receive in return. This is achieved by defining the request data for outgoing information and an analysis schema for the structured data you’ll get back.

#### Request data

Any JSON you put in here will be visible to the AI agent during the call - and can also be referenced with Prompt Variables.

For example, let’s say in the action you want to programmatically set the name of the person you’re calling. You could set request data to:

```json
{
    "name": "John Doe",
}
```

[Also see Bland documentation.](https://docs.bland.ai/api-v1/post/calls)

#### Analysis schema

Define a JSON schema for how you want to get information about the call - information like email addresses, names, appointment times or any other type of custom data.

For example, if you wanted to retrieve this information from the call:

```json
{
    "email_address": "email",
    "first_name": "string",
    "last_name": "string",
    "wants_to_book_appointment": "boolean",
    "appointment_time": "YYYY-MM-DD HH:MM:SS"
}
```

When retrieving the call details, Bland will return data about the call in the following format:

```json
{
  "analysis": {
    "email_address": "johndoe@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "wants_to_book_appointment": true,
    "appointment_time": "2024-01-01 12:00:00"
  }
}
```

[Also see Bland documentation.](https://docs.bland.ai/api-v1/post/calls)

### Get call details

Retrieve the details of a call based on the provider call ID.

### Send SMS

Send an SMS message from an agent to a user. This creates or resumes a conversation and triggers the associated processing workflow.

> SMS is an Enterprise-only Bland feature. Contact your Bland representative for access.

**Inputs:**

- `to` (phone, required) – the E.164 number receiving the message.
- `agentNumber` (phone, required) – the E.164 number sending the message; must belong to the authenticated account.
- `text` (text, optional) – the message body. If omitted, Bland generates a response from the conversation's configured pathway/prompt.
- Optional overrides: `newConversation`, `personaId`, `personaVersion`, `personaSettings`, `pathwayId`, `pathwayVersion`, `startNodeId`, `webhook`, `requestData`, `metadata`, `outcomeIds`, `citationSchemaIds`, `channel`, `contentSid`, `contentVariables`, `timeOut`, `timeoutMessage`, `warningTime`, `warningMessage`, and an `otherData` JSON escape hatch.

**Data points:** `conversationId`, `workflowId`, `messageId`, `message`.

The action injects the Awell patient/care-flow/activity IDs into `request_data` so they are returned in Bland's webhook payloads, and sends an idempotency key (the activity ID) so automated retries never double-send.

[Also see Bland documentation.](https://docs.bland.ai/api-v1/post/sms-send)
