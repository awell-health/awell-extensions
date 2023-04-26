# Example Partner extension

Here's an example of an example extension that uses the OAuth2 Client Credentials grant type.

A few features / items of note here:
1. The settings are defined at the extension level and contain the auth info
2. The fields and datapoints are defined at the action level and define what information is passed into the extension, as well as what information is pushed back into the pathway as a datapoint.
3. The authentication is buried in the API client and tokens are managed automatically
4. Tests mock the API client so you can build your test suite appropriately
5. In the action, we validate fields and settings to make sure the correct data types are passed

There is still some boilerplate that needs to be cleaned up (handling axios and zod errors), so a little copy/paste there for now.