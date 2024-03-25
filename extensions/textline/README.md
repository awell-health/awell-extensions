---
title: TextLine
description: Textline's business texting software offers solutions for sales, marketing, customer service and beyond. Utilize the power of SMS to grow quickly.
---

# TextLine

TextLine is a customer engagement platform used by hundreds of thousands of businesses and more than ten million developers worldwide to build unique, personalized experiences for their customers.

They are known for democratizing channels like voice, text, chat, video, and email through APIs, making it easy for every organization to build meaningful interactions with customers on the channels they prefer.

## Extension settings

In order to set up this extension, you will need:

1. A TextLine API key or auth token which can be found in the TextLine console.
2. Your account SID which can be found in the TextLine console.
3. A phone number to send the message from. This must be a TextLine phone number that you own.

## Custom Actions

### Send SMS

Send an SMS with TextLine to a recipient of your liking.

### Get messages

This action retrieves received messages. One can apply the `phoneNumber` filter to this action to display only received messages from that `phoneNumber`.
Only the last 30 messages are returned.

### Set Contact Consent

For HIPAA and Pro accounts setup with Contact Consent, this action can set contact's consent status. To do this, your account must have API import allowed and the user making the API request must have the "Can manually set consent" permission on for their role. You must then use the Contact's phone number and their consent status (true or false).

#### Simple Use Case

**Initiating a Conversation**: A user sends a message to "Number A", initiating a conversation.

**Receiving a Response**: "Number A" responds to the message, contributing to the ongoing conversation.

**Searching Messages & Applying Filters**: To focus on the responses from "Number A", `phoneNumber`` filter can be applied to only show received messages from "Number A" within the conversation. This allows users to easily review and manage responses from "Number A", without the clutter of other received messages.

