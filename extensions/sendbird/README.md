---
title: Sendbird
description: Sendbird is a cloud-based chat and messaging platform that enables developers to integrate real-time messaging functionality into their applications.
---

# Sendbird

Sendbird is a cloud-based chat and messaging platform that enables developers to integrate real-time messaging functionality into their applications.

Sendbird offers a range of features, including real-time chat, group chat, one-on-one messaging, push notifications, and file sharing. It supports various platforms and programming languages, making it flexible and accessible for developers to integrate with different applications.

## Extension settings

In order to set up this extension, you will need:

1. An **Application ID** - visit https://dashboard.sendbird.com/ to retrieve **Application ID** for the app of your choosing
2. A **Chat API token** - visit Application's settings and go to **Settings > Application > General > API tokens** to retrieve either Master API token or Secondary API token
3. A **Desk API token** - visit Application's settings and go to **Settings > Desk > Credentials** to retrieve Desk API token

## Custom Actions

### Create user

Creates a user in Sendbird using the Chat API. See [Update metadata](#update-metadata) to check metadata field details. The `userId` of the newly created user is then saved as a data point.

### Update user

Updates a user using the Chat API.

Please note that updating `metadata` of a user needs to be done with the [Update metadata action](#update-metadata).

### Delete user

Deletes a user in Sendbird using the Chat API.

### Get user

Retrieve information about a user using the Chat API. The following fields are saved as a data point:

- Nickname
- Access token
- Is active
- Created at
- Last seen at
- Has ever logged in
- Metadata (stored as string)

### Update metadata

Updates the user's metadata using the Chat API. Only updates existing or adds new fields to metadata. To delete some metedata fields, check the [Delete metadata action](#delete-metadata).

Metadata is a JSON object that can store up to five key-value items of additional user information such as a phone number, an email address, or a long description of the user. The key must not have a comma (,) and its length is limited to 128 characters. The value must be a string and its length is limited to 190 characters.

### Delete metadata

Deletes user metadata using the Chat API. Takes the key of a metadata item to be deleted (deletes one key at a time if a key is provided). If not specified, all items of the metadata are deleted.

### Deactivate user

Deactivates a user, using the "Update user" endpoint, in the Chat API. Optionally, it can be set for the user to `Leave all group channels upon deactivation`.

The user is deactivated by setting `is_active` to false.

### Activate user

Activates a user, using the "Update user" endpoint, in the Chat API. The user is activated by setting `is_active` to true.

### Create customer

Creates a customer using the Desk API. Only the `sendbirdId` is passed and it must be an ID that already exists in Sendbird's Chat platform (eg: the `userId` of an existing user). The `customerId` of the newly created customer is stored as data point.

To add custom fields to your customer, use the [Update custom fields action](#update-customers-custom-fields).

### Get customer

Retrieves information on a specific customer using the Desk API. The following fields are saved as a data point:

- Sendbird ID
- Channel Type
- Project
- Created At
- Display Name
- Custom Fields (stored as string)

### Update customer's custom fields

Updates a customer's custom fields using the Desk API.

Custom fields is a JSON object that can store up to twenty key-value items for additional customer information such as a phone number, an email address, or a long description of the customer.

The specified keys must be registered as a custom field in Settings > Customer fields of your dashboard beforehand. The key must not have a comma (,) and its length is limited to 20 characters. The value's length is limited to 190 characters.

### Create ticket

Creates a ticket using the Desk API. The `ticketId` of the newly created ticket is stored as data point.

Please note that the Ticket won't be shown in the Sendbird console **until** the user for which that Ticket was created writes a message inside the Chat.
