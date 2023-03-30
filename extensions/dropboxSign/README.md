# Dropbox Sign

Dropbox Sign (formerly HelloSign) is the easiest way to send, receive and manage legally binding electronic signatures.

## Extension settings

In order to set up this extension, **you will need to provide a Dropbox Sign API key**.

## Custom Actions

### Send signature request with template

Creates and sends a new SignatureRequest based off of a template specified with the template id parameter.

### Get signature request

Returns the SignatureRequest specified by the signature request id parameter.

### Send request reminder

Sends an email to the signer reminding them to sign the signature request. You cannot send a reminder within 1 hour of the last reminder that was sent. This includes manual AND automatic reminders.

**NOTE:** This action can not be used with embedded signature requests.

### Cancel signature request

Cancels an incomplete signature request. This action is not reversible.