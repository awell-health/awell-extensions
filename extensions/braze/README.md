---
title: Braze
description: Braze is a customer engagement platform that helps you communicate with your patients.
---

# Braze

Braze is a comprehensive customer engagement platform that specializes in helping businesses connect with their users through personalized messaging channels.

## Extension settings

An api key and the REST Endpoint URL are needed to be provided in order for the extension to authenticate with Braze's API. 

An app ID can also be specified via the extension settings or the action field. Actions requiring an app ID to be provided via the action field will throw an error if no app ID is provided via the extension settings or the action field. If both are provided, the app ID from the action field will be used.

List of URLs can be found [here](https://www.braze.com/docs/api/basics/#endpoints) - make sure it's the REST Endpoint URL. Documentation on API keys can be found [here](https://www.braze.com/docs/api/basics/#about-rest-api-keys).

## Supported Actins

### Send SMS

Send an immediate SMS message to a specified user

Required permissions: `messages.send`

### Schedule SMS

Schedule an SMS message to be sent at a specific time

Required permissions: `messages.schedule.create`

### Send Email

Send an immediate email to a specified user

Required permissions: `messages.send`

### Schedule Email

Schedule an email to be sent at a specific time

Required permissions: `messages.schedule.create`

### Send Email Using Template

Send an email using a pre-defined Braze template

Required permissions: `messages.send`

### Send campaign

Send a campaign message.

Required permissions: `campaigns.trigger.send`
