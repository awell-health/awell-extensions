# Sendgrid

SendGrid is a cloud-based email delivery platform that provides services for sending and managing email campaigns, transactional emails, and other types of messages.

## Extension settings

In order to set up this extension, you will need to provide:

1. An API key
2. A from name
3. A from email

## Custom Actions

### Send email

Allows for sending a plain email to a recipient.

### Send email with a template

Allows for sending an email based on a template to a recipient. You can also insert variables so they are rendered in your template.

### Add or update contact

Allows adding or updating contacts. The contact to update will be determined only by the email field and any fields omitted from the request will remain as they were. A contact's ID cannot be used to update the contact.

Please note that custom fields need to have been already created if you wish to set their values for the contacts being upserted. To do this, please use the "Create Custom Field Definition" endpoint. They also can be created in **Marketing -> Custom Fields** section in Sendgrid.
