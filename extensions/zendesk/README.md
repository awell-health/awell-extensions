---
title: Zendesk Support
description: Zendesk Support is a customer service platform that provides ticketing, knowledge base, and customer communication tools.
---

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

### Get Ticket

Retrieves a support ticket from Zendesk, including the requester's name and email.

**Required fields:**
- Ticket ID: The unique identifier of the ticket to retrieve

**Returns:**
- Ticket ID, Ticket URL, Subject, Description (first comment), Status, Priority, Type, Channel
- Tags (array), External ID
- Requester ID, Requester Name, Requester Email
- Assignee ID, Group ID, Organization ID
- Created At, Updated At
- Custom Fields (JSON array of `{ id, value }`)
- Ticket (the full ticket object as JSON)

### Update Ticket

Updates an existing support ticket in Zendesk.

**Required fields:**
- Ticket ID: The unique identifier of the ticket to update

**Optional fields:**
- Comment: A comment to add to the ticket
- Priority: The priority level (urgent, high, normal, or low)
- Status: The new status (new, open, pending, hold, solved, or closed)

### Delete Ticket

Deletes a support ticket in Zendesk. This action permanently removes the ticket from your Zendesk instance.

**Required fields:**
- Ticket ID: The unique identifier of the ticket to delete

**Note:** This action cannot be undone. Deleted tickets are permanently removed from Zendesk.

## Webhooks

### Ticket event

Starts a care flow when Zendesk sends a webhook about a ticket. The webhook only needs the ticket ID: the extension fetches the full ticket from the Zendesk API (using the extension settings) so the data points do not depend on what is included in the request body.

Zendesk lets you connect a webhook in one of two ways. The Ticket event webhook supports both.

#### Option 1: connect the webhook to a trigger or automation (recommended for ticket activity)

1. In Awell, create an incoming webhook of type "Extension webhook", select the Zendesk extension and the "Ticket event" event. Copy the generated URL.
2. In Zendesk Admin Center, go to **Apps and integrations > Webhooks > Actions > Create webhook** and choose **Trigger or automation**.
3. Set the endpoint URL to the Awell webhook URL, request method `POST` and request format `JSON`.
4. Create (or edit) a trigger under **Objects and rules > Business rules > Triggers**. Set the conditions that should start the care flow (for example, a tag is added or a status changes) and add the action **Notify active webhook**, selecting the webhook created above.
5. Use the following JSON body. `ticket_id` is required; `event_type` is an optional label that is exposed on the `eventType` data point. Any additional properties are passed through on the `payload` data point.

```json
{
  "ticket_id": "{{ticket.id}}",
  "event_type": "kit_retrieval_requested"
}
```

#### Option 2: subscribe the webhook to Zendesk ticket events

When creating the webhook in Zendesk Admin Center, choose **Zendesk events** and subscribe to one or more ticket events (for example `Ticket created` or `Ticket status changed`). Zendesk sends its standard event envelope (`type` starting with `zen:event-type:ticket.`) and the extension reads the ticket ID from `detail.id`. The Zendesk event type is exposed on the `eventType` data point.

Note: a webhook's connection method cannot be changed after it is created, and Zendesk's documentation is not consistent about which accounts can subscribe to ticket events. If ticket events are not available in your account, use option 1.

**Data points:**
- Event Type: the `event_type` from the trigger body (defaults to `trigger`), or the Zendesk event type
- Payload: the raw request body as JSON
- All data points returned by the Get Ticket action (Ticket ID, Ticket URL, Subject, Description, Status, Priority, Type, Channel, Tags, External ID, Requester ID/Name/Email, Assignee ID, Group ID, Organization ID, Created At, Updated At, Custom Fields, Ticket)

**Responses:**
- `400` when the body contains neither a `ticket_id` nor a Zendesk ticket event, or the extension settings are invalid
- `404` when the ticket does not exist in Zendesk
