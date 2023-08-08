# Sendbird

Sendbird is a cloud-based chat and messaging platform that enables developers to integrate real-time messaging functionality into their applications.

Sendbird offers a range of features, including real-time chat, group chat, one-on-one messaging, push notifications, and file sharing. It supports various platforms and programming languages, making it flexible and accessible for developers to integrate with different applications.

## Extension settings

In order to set up this extension, you will need:

1. A **Application ID** - visit https://dashboard.sendbird.com/ to retrieve **Application ID** for the app of your choosing
2. A **Chat API token** - visit Application's settings and go to **Settings > Application > General > API tokens** to retrieve either Master API token or Secondary API token
3. A **Desk API token** - visit Application's settings and go to **Settings > Desk > Credentials** to retrieve Desk API token

## Custom Actions

### Create user

Creates a user using Chat API. See [Update metadata](#update-metadata) to check metadata field details. `userId` is then saved as a data point.

### Update user

Updates a user using Chat API. Please note that `metadata` cannot be updated using that action, please check [Update metadata](#update-metadata) for that regard.

### Delete user

Deletes a user using Chat API.

### Get user

Gets a user using Chat API. The following fields are saved as a data point:

- Nickname
- Access token
- Is active
- Created at
- Last seen at
- Has ever logged in
- Metadata (stored as string)

### Update metadata

Updates user's metadata using Chat API. Only updates existing or adds new fields to metadata. To delete some fields check [Delete metadata](#delete-metadata).

It is a JSON object to store up to five key-value items for additional user information such as a phone number, an email address, or a long description of the user. The key must not have a comma (,) and its length is limited to 128 characters. The value must be a string and its length is limited to 190 characters.

### Delete metadata

Deletes user metadata using Chat API. Takes the key of a metadata item to be deleted. If not specified, all items of the metadata are deleted.

### Deactivate user

Deactivates a user using Chat API. Optionally, it can be set for user to `Leave all group channels upon deactivation`.

### Activate user

Activates a user using Chat API.

### Create customer

Creates customer using Desk API. Only `sendbirdId` is passed and it must be an ID that already exists in Sendbird Chat platform (for ex. `userId` of an existing user). Saves `customerId` as data point.

### Get customer

Gets customer using Desk API. The following fields are saved as a data point:

- Sendbird ID
- Channel Type
- Project
- Created At
- Display Name
- Custom Fields (stored as string)

### Update customer's custom fields

Updates customer's custom fields using Desk API.

It is a JSON object to store up to twenty key-value items for additional customer information such as a phone number, an email address, or a long description of the customer. The specified keys must be registered as a custom field in Settings > Customer fields of your dashboard beforehand. The key must not have a comma (,) and its length is limited to 20 characters. The value's length is limited to 190 characters.

### Create ticket

Creates ticket using Desk API. Saves `ticketId` as data point. Also, please note that the Ticket won't be shown in Sendbird console UNTIL the user for which that Ticket was created writes a message inside the Chat.
