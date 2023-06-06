# DocuSign

Make your business faster, simpler and more cost-efficient with electronic agreements. Agree with confidence, with intuitive signing experiences across virtually any device.

## Extension settings

In order to set up this extension, you will need to provide the following settings:

1. **Integration key (client ID)** - An integration key identifies your integration and links to its configuration values. This can be obtained in your developer account from the **Apps and Keys** page
2. **API Account ID** - A GUID value that identifies your account. This can be obtained in your developer account from the **Apps and Keys** page
3. **Impersonated User ID (UserID)** - This is a GUID identifying the DocuSign user that you will be impersonating with the access token. Your own User ID can be found at the top of the **Apps and Keys** page.
4. **RSA private key (in Base64 format)** - This is for the integration key you obtained above and can also be created on the **Apps and Keys** page. You only need the private key, and it can only be copied once. Make sure to retain it for your records. Provide it in Base64 format - if you copy the key as is, it will not be valid as newlines and formatting won't be persisted.
5. **Base URL** - Base URL for API calls matching your environment. Can be obtained from **Account Base URI** section of the **Apps and Keys** page or the `base_uri` property in the response of a call to the `/oauth/userinfo`.
   1. `DEV` environment: https://demo.docusign.net
   2. `PRODUCTION` environment: **https://`{server}`.docusign.net**, where `{server}` is the data center location of your production account (for example, **CA**, **NA2**, or **EU**)

Also, before working with **DocuSign** you should receive consent of the user to impersonate them with the API calls. Check the details on how to do that [on DocuSign docs](https://developers.docusign.com/platform/auth/consent/obtaining-individual-consent/). It's a ONE TIME operation and is required for API calls to work.

## Custom Actions

### Embedded signing

Embedded Signing gives users the ability to sign documents directly from Awell Hosted Pages using DocuSign's embedded signing feature. First an embedded signature request with a template is created and then a signing URL is generated for the signature request. Via the signing URL, we can let the user sign the request from within Awell.

Embedded signing behaves as a blocking action where the action is only completed when the signature request is effectively signed.

**In order to add embedded signing, you need to add 2 actions to you care flow:**

1. First, add the "Create embedded signature request with template" action. This action will create an embedded signature request based on a template and return a **sign URL**.
2. Second, add the "Embedded signing" action. In this action you will have to configure the **sign URL** you got from the first action.

**Please note that the signing URL generated in the first step is only valid for 1 hour.** This means that from as soon as the first action is activated, the user has 1 hour to complete the signing request. When the sign URL has expired, the document cannot be signed anymore and and the process would have to be repeated.
