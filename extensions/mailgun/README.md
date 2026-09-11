---
title: Mailgun
description: Mailgun is a cloud-based email delivery service that allows businesses and developers to send, receive, and track email messages.
---
# Mailgun

Mailgun is a cloud-based email delivery service that allows businesses and developers to send, receive, and track email messages. It provides a powerful set of APIs that enable users to integrate email into their applications, automate email delivery, and improve deliverability rates. 

With Mailgun, users can send transactional emails as well as marketing emails, newsletters, and other types of bulk email. The platform also offers real-time email analytics and tools to manage unsubscribes and bounces. Overall, Mailgun provides a reliable and scalable solution for businesses and developers to handle their email needs.

## Extension settings

In order to set up this extension, you will need to provide a:

1. Mailgun API key
2. Mailgun domain
3. From name
4. From email

## Custom Actions

### Send email

Allows for sending a plain email to a recipient, optionally with a single file attachment.

**Inputs:**

- **To** (required): recipient email address(es), comma-separated.
- **Subject** (required)
- **Body** (required): HTML content of the email.
- **Attachment content (base64)** (optional): the base64-encoded file to attach. Typically bound to the `base64Pdf` data point produced by the Transform extension's "HTML to PDF" action.
- **Attachment filename** (optional, required when attachment content is set): the filename the recipient sees, including extension, e.g. `Health-Snapshot.pdf`.
- **Attachment content type** (optional): MIME type of the attachment. Defaults to `application/pdf`.

Leave the attachment fields empty to send the email without an attachment. Attachments are limited to 20 MB (decoded) to stay under Mailgun's 25 MB message limit.

### Send email with a template

Allows for sending an email based on a template to a recipient. You can also insert variables so they are rendered in your template.
