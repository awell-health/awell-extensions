---
title: Slack
description: Slack is a messaging platform for teams that brings all your communication together, giving everyone a shared workspace where conversations are organized and accessible.
---
# Slack

Slack is a messaging platform for teams that brings all your communication together, giving everyone a shared workspace where conversations are organized and accessible.

This extension allows you to send messages to Slack channels from your care flows, keeping your team informed about important events and updates.

## Extension settings

In order to set up this extension, you will need:

1. A Slack App with a Bot User OAuth Token (starts with `xoxb-`)
2. The bot must have the `chat:write` OAuth scope

### Setting up your Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) and click "Create New App"
2. Choose "From scratch" and give your app a name
3. Navigate to "OAuth & Permissions" in the sidebar
4. Under "Scopes", add the `chat:write` Bot Token Scope
5. Click "Install to Workspace" at the top of the page
6. Copy the "Bot User OAuth Token" (starts with `xoxb-`)
7. Use this token in the extension settings

### Inviting the bot to channels

Before the bot can post messages to a channel, it must be invited to that channel. You can do this by:

1. Going to the channel in Slack
2. Typing `/invite @YourBotName`

## Custom Actions

### Send Message to Channel

Send a message to a Slack channel.

**Input fields:**
- **Channel** (required): The Slack channel to send the message to. You can use either the channel ID (e.g., `C1234567890`) or the channel name (e.g., `#general`). The bot must be invited to the channel.
- **Message** (required): The message content to send to the channel.

**Output data points:**
- **messageTs**: The timestamp/ID of the posted message. This can be used for threading or updating the message later.
- **channelId**: The channel ID where the message was posted.
