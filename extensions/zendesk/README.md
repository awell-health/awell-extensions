# Zendesk Support

Zendesk Support is a customer service platform that provides ticketing, knowledge base, and customer communication tools.

## Extension settings

To set up this extension, you will need to provide the following:

1. **Zendesk Subdomain:** your Zendesk subdomain (e.g., "company" for company.zendesk.com)
2. **OAuth Client ID:** the client ID of the OAuth app you created in Zendesk
3. **OAuth Client Secret:** the client secret of the OAuth app you created in Zendesk

You'll have to set up an [OAuth app](https://developer.zendesk.com/api-reference/introduction/security-and-auth/#oauth-access-token) in Zendesk to provision a client ID and secret.

## Actions

### Create Ticket

Creates a new support ticket in Zendesk with the specified details.

**Required fields:**
- Subject: The subject line of the ticket
- Comment: The initial comment/description for the ticket

**Optional fields:**
- Group ID: The ID of the group to assign the ticket to
- Priority: The priority level (urgent, high, normal, or low)
- External ID: An external identifier to link this ticket to your system
- Tag: A tag to add to the ticket

**Returns:**
- Ticket ID: The unique identifier of the created ticket
- Ticket URL: Direct link to the ticket in Zendesk agent interface
