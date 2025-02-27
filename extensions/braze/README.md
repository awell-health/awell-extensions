---
title: Braze
description: Braze is a customer engagement platform that helps you communicate with your patients.
---

# Braze

Braze is a comprehensive customer engagement platform that specializes in helping businesses connect with their users through personalized messaging channels.

## Supported Actins

- **sendSMS** - Send an immediate SMS message to a specified user
- **scheduleSMS** - Schedule an SMS message to be sent at a specific time
- **sendEmail** - Send an immediate email to a specified user
- **scheduleEmail** - Schedule an email to be sent at a specific time
- **sendEmailUsingTemplate** - Send an email using a pre-defined Braze template

## Extension settings

An api key and the REST Endpoint URL are needed to be provided in order for the extension to authenticate with Braze's API.
List of URLs can be found [here](https://www.braze.com/docs/api/basics/#endpoints) - make sure it's the REST Endpoint URL.
Documentation on API keys can be found [here](https://www.braze.com/docs/api/basics/#about-rest-api-keys).

Permissions needed for the API key: 
- messages.schedule.create (Schedule a message to be sent at a specific time.)
- messages.send (Send an immediate message to specific users.)


