---
title: Zoom
description: Zoom is a communications platform that allows users to connect with video, audio, phone, and chat.
---

# Zoom

Zoom is a communications platform that allows users to connect with video, audio, phone, and chat.

## Extension settings

To set up this extension, you will need to provide the following:

1. **Account ID:** your Zoom account ID, found on the Server to Server app build page.
2. **Client ID:** the client ID of the OAuth app you created in Zoom
3. **Client secret:** the client secret of the OAuth app you created in Zoom

You'll have to set up a [Server-to-Server OAuth app](https://developers.zoom.us/docs/internal-apps/create/) in Zoom to provision a client ID and secret.

## Actions

### Send SMS

Send an SMS to a recipient.

Ensure your account credentials have the following scopes set:
- Scopes: `contact_center_sms:write:admin`
- Granular Scopes: `contact_center:write:sms:admin`
