---
title: Twilio
description: Twilio is a customer engagement platform used by hundreds of thousands of businesses and more than ten million developers worldwide to build unique, personalized experiences for their customers.
---
# Twilio

Twilio is a customer engagement platform used by hundreds of thousands of businesses and more than ten million developers worldwide to build unique, personalized experiences for their customers.

They are known for democratizing channels like voice, text, chat, video, and email through APIs, making it easy for every organization to build meaningful interactions with customers on the channels they prefer.

## Extension settings

In order to set up this extension, you will need:

1. A Twilio API key or auth token which can be found in the Twilio console.
2. Your account SID which can be found in the Twilio console.
3. A phone number to send the message from. This must be a Twilio phone number that you own.

## Custom Actions

### Send SMS

Send an SMS with Twilio to a recipient of your liking.

### Get messages

Get a list of text messages matching the given criteria. Only the last 50 messages are returned.

## Send SMS during working hours

This action allows for the scheduling of SMS messages to be sent within the "daily operational hours" of 9 AM to 5 PM. It ensures that text messages are dispatched at appropriate times during the day, avoiding early morning or late-night disturbances to recipients.

**Here's how it works:**

- If the action is activate during business hours (9 AM to 5 PM), the SMS is sent immediately.
- If activated before 9 AM, the SMS is scheduled to be sent at 9 AM on the same day.
- If activated after 5 PM, the SMS is scheduled to be sent at 9 AM the following day.

This setup ensures that all messages reach your respondents during reasonable daytime hours, enhancing the likelihood of a timely and considerate communication. It's important to mention that messages will still be dispatched over the weekend, but they will adhere to the "business hours" schedule of 9 AM to 5 PM.

Note that scheduling messages with Twilio is only possible if you send text messages using a MessagingServiceSid.






