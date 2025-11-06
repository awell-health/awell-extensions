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

Ensure your Server-to-Server OAuth app has the following scopes set:

- Scopes: `contact_center_sms:write:admin`
- Granular Scopes: `contact_center:write:sms:admin`

#### Result codes

On completion, the action returns a `code` data point indicating the outcome:

- **SUCCESS**: SMS was sent successfully.
- **INVALID_CONSUMER_NUMBER_FORMAT**: Invalid consumer number; E.164 format is required.
- **CONTACT_CENTER_NUMBER_USED**: Zoom Contact Center numbers cannot be used as consumer numbers.
- **CONSUMER_NOT_OPTED_IN**: The consumer number you have messaged has not opted in.
- **CONSUMER_OPTED_OUT**: The consumer number has opted out of receiving SMS from this Zoom Contact Center number.
- **CONSUMER_BLOCK_LISTED**: The consumer number is block-listed by your Zoom Contact Center administrator.
- **INTERNATIONAL_SMS_NOT_SUPPORTED**: International messaging is not supported on this account.
- **BODY_TOO_LONG**: Validation error — body exceeds 500 characters.
