---
title: Infobip
description: Infobip is a global cloud communications platform that provides a wide range of communication and customer engagement solutions for businesses.
---

# Infobip

Infobip is a global cloud communications platform that provides a wide range of communication and customer engagement solutions for businesses. The company offers a suite of services and tools designed to help organizations connect with their customers, clients, and partners through various communication channels, including SMS, email, voice, chat apps, and more.

## Extension settings

In order to set up this extension, you will minimaly need to provide:

1. Your unique API [base URL](https://www.infobip.com/docs/essentials/base-url)
2. An [API key](https://www.infobip.com/docs/essentials/api-authentication)

When utilizing the Infobip extension for sending emails and text messages, you'll need a 'from email' address and a 'from phone number' respectively.

## Actions

### Send SMS

Send a text message to a recipient.

### Send email

Sends a simple email to a recipient.

### Send email with template

Send an email, using a template, to a recipient. You need to create a [Broadcast email template](https://www.infobip.com/docs/email/templates) as that is the only type of template supported by Infobip's API. Templates can be created and managed via the Infobip web portal.

When using this action, the from/sender details and subject as specified in the template will be used. However, you can specify a subject if you would like to overwrite the subject specified in the template.

Within your template, you can harness placeholders using Infobip's `{{` syntax. This feature allows you to craft templates with both static and dynamic content. You can determine the dynamic content's value when configuring the action in Awell Studio. For instance, if your template includes two placeholders, `{{variable_1}}` and `{{variable_2}}`, you can provide the following data in the placeholders action field to set values for these placeholders:

```json
{
  "variable_1": "Hello",
  "variable_2": "World"
}
```
