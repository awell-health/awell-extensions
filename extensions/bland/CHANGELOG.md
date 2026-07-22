# CHANGELOG

## Unreleased

- Added `sendSms` action: send an SMS immediately via Bland `POST /v1/sms/send`. The agent message is optional; when omitted, the pathway configured on the agent number generates the message.
- Added `createSmsConversation` action: seed an SMS conversation positioned at pathway state via Bland `POST /v1/sms/create` without sending a message.
- Added optional timeout fields to `sendSms` (`time_out`, `timeout_message`, `warning_time`, `warning_message`): per-conversation overrides for Bland's silence-timeout flow.
- Added `completedBlandText` webhook: triggered when a Bland SMS conversation ends. Maps conversation data (status, reason, transcript, pathway variables) to data points and resolves the patient via the `awell_patient_id` echoed back in metadata.
