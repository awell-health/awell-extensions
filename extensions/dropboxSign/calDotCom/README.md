# What is Cal.com?

[Cal.com](https://cal.com/) is a modern and **open source** scheduling platform. With HIPAA, GDPR and SOC2 compliance, you can ensure that data is well-protected and that makes Cal.com a great fit for healthcare use cases.
## Cal.com x Awell

This extension allows you to let a stakeholder (eg: a patient) book an appointment as part of a care flow and to retrieve the booking details of an appointment.

# Extension settings

In order to set up this extension, **you will need to provide a Cal.com API key**. You can obtain an API key via the Cal.com portal (`Settings > Developer > API keys`).

# Custom Actions

## Book appointment action

You can add this action to your care flow to enable a stakeholder (eg: a patient) to book an appointment in a predefined calendar. This is a **stakeholder-actionable action** which means it requires an actual user to book an appointment. Also note that this is a blocking action and that the care flow will not progress - unless there are parallel tracks or transitions - until the action/activity is completed (i.e. an appointment was booked).

**The actual booking of the appointment can happen in two ways:**

1. With Awell Hosted Pages: when the "Book appointment" action is activated, we serve the booking widget to the stakeholder so they can book an appointment directly from within Awell Hosted Pages.
2. If you are not leveraging Awell Hosted Pages but have built a custom integration then we expose you all the details via our API so you can either create a Cal.com booking widget yourself or redirect the user to the Cal.com platform. Additionally, we expose a mutation that allows you to complete the activity and pass in the required data.

Below you can find an overview of all Awell Apps and whether they support rendering of the booking widget.

| App                           | Supported |
|-------------------------------|-----------|
| Awell Hosted Pages            | Yes       |
| Your app (custom integration) | Yes       |
| Awell Care                    | No        |
| Awell MyCare                  | No        |

### Data points

Adding this action to your care flow will expose a new data point you can use in your care flow, the `bookingId`. When the care flow is orchestrated and the book appointment activity is completed, the id of the actual booking will be ingested as the value of that `bookingId` data point.

## Get booking action

This action allows you to fetch the details of a booking based on the provided `bookingId`. This action will make the following data points available for you to use in your care flow:

1. Event type ID
2. Title
3. Description
4. Start time
5. End time
6. Status

# Pricing

**This extension is free** but keep in mind that you might need a paid plan for Cal.com depending on your needs.

# Limitations

## Rescheduling

When a previously made booking is rescheduled, there is no way yet to get the new/updated booking details into the care flow or have the care flow react on the updated booking.

Also note that when a booking is rescheduled, Cal.com doesn't update the original booking resource but creates a new one instead. As far as we know, there is no reference from the old booking to the new (rescheduled) booking.

### Example

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
