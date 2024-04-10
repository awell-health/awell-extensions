---
title: Talkdesk
description: Talkdesk is a cloud-based customer experience and contact center software company. It provides a platform that enables businesses to set up and manage their customer service and support operations.
---
# TalkDesk

Talkdesk is a cloud-based customer experience and contact center software company. It provides a platform that enables businesses to set up and manage their customer service and support operations. Talkdesk offers a range of features and tools to streamline and enhance communication between businesses and their customers.

## Setup

To set up the extension, you'll need your Talkdesk account name along with a client ID and client secret. Please ensure that the credentials you provide are associated with the necessary permissions, or "scopes," to run the extension:

- flows-interactions:start

## Custom Actions

### Trigger flow

Enables the initiation of a Talkdesk flow directly from an Awell careflow. This feature triggers an interaction using the most recent published version of a specific Studio flow. You'll need to supply the ID of the flow and the data (as a JSON object) that you want to input into the flow.

Important: Please note that Talkdesk sets a restriction of up to two API requests per second (rps) for each account using their Flows API.

[Click here](https://studio.talkdesk.com/docs/sending-notifications-to-contacts-via-api-request) to learn more about triggering flows via the Talkdesk API and here to read the [API docs](https://docs.talkdesk.com/reference/flows-api-ref).
