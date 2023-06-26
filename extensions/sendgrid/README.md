# Sendgrid

From design to deliverability, raise the bar across all email you send with Marketing Campaigns.

Deliver Exceptional Email Experiences with SendGrid. Leverage the email service that customer-first brands trust for reliable inbox delivery at scale.

## Extension settings

In order to set up this extension, you will need to provide a:

1. API key
2. From name
3. From email

## Custom Actions

### Send email

Allows for sending a plain email to a recipient.

### Send email with a template

Allows for sending an email based on a template to a recipient. You can also insert variables so they are rendered in your template. Notes:

1. subject field - when using template, a `{{ subject}}` field must be placed in `Subject` field in your template inside Sendgrid in order for this to work
2. templateContent field - this field is a collection of key/value pairs following the pattern "variable_name":"value to insert". Must be stringified.
   1. e.g.: `{"name":"John Doe"}`
