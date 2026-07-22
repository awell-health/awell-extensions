# CHANGELOG

## Unreleased

- Added `sendSms` action: send an SMS immediately via Bland `POST /v1/sms/send`. The agent message is optional; when omitted, the pathway configured on the agent number generates the message.
- Added `createSmsConversation` action: seed an SMS conversation positioned at pathway state via Bland `POST /v1/sms/create` without sending a message.
