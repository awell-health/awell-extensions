---
title: Cal.com
description: Cal.com is a modern and open source scheduling platform. With HIPAA, GDPR and SOC2 compliance, you can ensure that data is well-protected and that makes Cal.com a great fit for healthcare use cases.
---

# Cal.com

[Cal.com](https://cal.com/) is a modern and **open source** scheduling platform. With HIPAA, GDPR and SOC2 compliance, you can ensure that data is well-protected and that makes Cal.com a great fit for healthcare use cases.

## Cal.com x Awell

This extension allows you to let a stakeholder (eg: a patient) book an appointment as part of a care flow and to retrieve the booking details of an appointment.

## Extension settings

In order to set up this extension, **you will need to provide a Cal.com API key**. You can obtain an API key via the Cal.com portal (`Settings > Developer > API keys`).

## Custom Actions

### Book appointment action

You can add this action to your care flow to enable a stakeholder (eg: a patient) to book an appointment in a predefined calendar. This is a **stakeholder-actionable action** which means it requires an actual user to book an appointment. Also note that this is a blocking action and that the care flow will not progress - unless there are parallel tracks or transitions - until the action/activity is completed (i.e. an appointment was booked).

**The actual booking of the appointment can happen in two ways:**

1. With Awell Hosted Pages: when the "Book appointment" action is activated, we serve the booking widget to the stakeholder so they can book an appointment directly from within Awell Hosted Pages.
2. If you are not leveraging Awell Hosted Pages but have built a custom integration then we expose you all the details via our API so you can either create a Cal.com booking widget yourself or redirect the user to the Cal.com platform. Additionally, we expose a mutation that allows you to complete the activity and pass in the required data.

Below you can find an overview of all Awell Apps and whether they support rendering of the booking widget.

| App                           | Supported |
| ----------------------------- | --------- |
| Awell Hosted Pages            | Yes       |
| Your app (custom integration) | Yes       |
| Awell Care                    | No        |
| Awell MyCare                  | No        |

#### Data points

Adding this action to your care flow will expose a new data point you can use in your care flow, the `bookingId`. When the care flow is orchestrated and the book appointment activity is completed, the id of the actual booking will be ingested as the value of that `bookingId` data point.

### Get booking action

This action allows you to fetch the details of a booking based on the provided `bookingId`. This action will make the following data points available for you to use in your care flow:

1. Event type ID
2. Title
3. Description
4. Start time
5. End time
6. Status
7. Cancel URL
8. Reschedule URL

### Update booking

Updates a booking and saves new `bookingId` and `bookingUid` as Data Points. Values possible to update:

- Title - Title of Booking event
- Description - Description of the meeting
- Status - Status of the meeting to be set. Possible values: "ACCEPTED", "PENDING", "CANCELLED", "REJECTED".
- Start - Start time of the Event in ISO 8601 format, e.g. 2023-05-24T13:00:00.000Z. Please note that start/end time must be within user's availability hours.
- End - End time of the Event in ISO 8601 format, e.g. 2023-05-24T13:00:00.000Z. Please note that start/end time must be within user's availability hours.

### Create booking

Creates a booking and saves new `bookingId` as Data Points. Available fields:

- Event Type ID - ID of the event type to book
- Responses - Object containing email, name, location
  - ```json
        "responses": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "location": "Calcom HQ"
        },
    ```
- Metadata - Any metadata associated with the booking
- Timezone - Timezone of the Attendee
- Language - Language of the Attendee
- Recurring Event ID - Recurring Event ID if the event is recurring
- Title - Title of Booking event
- Description - Description of the meeting
- Status - Status of the meeting to be set. Possible values: "ACCEPTED", "PENDING", "CANCELLED", "REJECTED".
- Start - Start time of the Event in ISO 8601 format, e.g. 2023-05-24T13:00:00.000Z. Please note that start/end time must be within user's availability hours.
- End - End time of the Event in ISO 8601 format, e.g. 2023-05-24T13:00:00.000Z. Please note that start/end time must be within user's availability hours.

### Delete Boooking

Deletes a Booking with a given ID.

## Pricing

**This extension is free** but keep in mind that you might need a paid plan for Cal.com depending on your needs.

## Limitations

### Rescheduling

When a previously made booking is rescheduled, there is no way yet to get the new/updated booking details into the care flow or have the care flow react on the updated booking.

Also note that when a booking is rescheduled, Cal.com doesn't update the original booking resource but creates a new one instead. As far as we know, there is no reference from the old booking to the new (rescheduled) booking.

#### Example

An appointment has been booked with Cal.com and we have the below booking resource:

```json
{
    ...,
    "bookingId": "1",
    "date": "Jan 1, 2023"
}
```

However, the patient reschedules the booking to Jan 10, 2023. When querying Cal.com's API (`GET v1/bookings/{bookingId}`), it will still return the old booking date instead of the new/rescheduled date.

```json
{
    ...,
    "bookingId": "1",
    "date": "Jan 1, 2023"
}
```

## Webhooks

Webhooks offer a great way to automate the flow with Awell when invitees schedule, cancel, or reschedule events, or when the meeting ends.

**Important notes:**

1. An Awell webhook endpoint can only listen to one event type. So make sure that when you create a webhook in Cal.com, the subscriber URL and the event trigger match the Awell webhook endpoint. This also means there can only be one event type per subscriber URL.
2. Using a secret to verify the authenticity of the received payload is not yet supported.
3. Custom payload templates are not supported, please use the default ones.
