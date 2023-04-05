# Dropbox Sign

Dropbox Sign (formerly HelloSign) is the easiest way to send, receive and manage legally binding electronic signatures.

## Extension settings

In order to set up this extension, you will need to provide the following settings:

1. API Key
2. Client ID - the id of the API app created in Dropbox Sign. Only required if want to use embedded signature requests.
3. Test mode - whether you want to execute all API calls to DropboxSign in test mode. When test mode is enabled, signature requests will not be legally binding. When disabled, keep in mind that you must upgrade to a paid DropboxSign API plan to create signature requests via the extension.

## Custom Actions

### Send signature request with template

Creates and sends a new SignatureRequest based off of a template specified with the template id parameter. The request will be send to specified signer via email. Please note that is a non-blocking action and that the care flow will automatically continue once the request is sent. It won't wait for the actual signing of the request.

To send signature requests via the DropboxSign API you must upgrade to a [paid API plan](https://app.hellosign.com/api/pricing).

### Get signature request

Returns the SignatureRequest specified by the signature request id parameter.

### Send request reminder

Sends an email to the signer reminding them to sign the signature request. You cannot send a reminder within 1 hour of the last reminder that was sent. This includes manual AND automatic reminders.

**NOTE:** This action can not be used with embedded signature requests.

### Cancel signature request

Cancels an incomplete signature request. This action is not reversible.

## Coming soon

### Create embedded signature request with template

Embedded Signing gives users the ability to sign documents directly from the Awell apps using Dropbox Sign's embedded signing feature. First an embedded signature request with a template is created and then a signing URL is generated for the signature request. Via the signing URL, we can let the user sign the request from within our apps.

Additionally, embedded signing behaves as a blocking action where the action is only completed when the signature request is effectively signed.

Below you can find an overview of all Awell Apps and whether they support embedded signing:

| App                           | Supported |
|-------------------------------|-----------|
| Awell Hosted Pages            | No        |
| Your app (custom integration) | No        |
| Awell Care                    | No        |
| Awell MyCare                  | No        |
