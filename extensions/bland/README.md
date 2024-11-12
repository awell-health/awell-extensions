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

Send an AI phone call using a simple prompt or a conversational pathway agent you've built in the Bland platform. **The action is completed when Awell receives a callback from the Bland platform.**

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