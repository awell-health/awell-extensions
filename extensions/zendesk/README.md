# Zendesk Support

Zendesk Support is a customer service platform that provides ticketing, knowledge base, and customer communication tools.

## Extension settings

To set up this extension, you will need to provide the following:

1. **Zendesk Subdomain:** your Zendesk subdomain (e.g., "company" for company.zendesk.com)
2. **User Email:** your Zendesk user email address
3. **API Token:** your Zendesk API token

You can generate an API token in your Zendesk admin settings under API > Zendesk API.

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

### Delete Ticket

Deletes a support ticket in Zendesk. This action permanently removes the ticket from your Zendesk instance.

**Required fields:**
- Ticket ID: The unique identifier of the ticket to delete

**Note:** This action cannot be undone. Deleted tickets are permanently removed from Zendesk.
