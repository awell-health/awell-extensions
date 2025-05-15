---
title: Braze
description: Braze is a customer engagement platform that helps you communicate with your patients.
---

# Braze

Braze is a comprehensive customer engagement platform that specializes in helping businesses connect with their users through personalized messaging channels.

## Extension settings

An api key and the REST Endpoint URL are needed to be provided in order for the extension to authenticate with Braze's API.

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
