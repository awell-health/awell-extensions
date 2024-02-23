# Twilio changelog

## v2 2024-02-22

1. Add capability to search for messages using all the allowed filters provided by Twilio API. Check here: https://www.twilio.com/docs/messaging/api/message-resource#read-multiple-message-resources

## v2 2023-06-23

Full description: https://github.com/awell-health/awell-extensions/issues/157

1. "Send SMS" action
   1. Change label from "Send SMS" to "Send SMS (with from number)"
   2. Throw error when "From" number in both settings and in fields is not provided
2. Add new action "Send SMS (with Messaging Service)"

## v2

Compared to v1 (pre-beta release), the extension only has one custom action "Send SMS" instead of two. The Custom Action allows for:

1. Sending a text message to a recipient (phone number) stored in a data point, including patient profile data points.
2. Sending a text message to a fixed recipient (phone number).
