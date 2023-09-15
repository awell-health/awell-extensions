# Cal.com changelog

## September 15, 2023

- add createBooking action

## September 4, 2023

- add updateBooking and deleteBooking actions
- update and refactor structure of getBooking and bookAppointment actions

## July 4, 2023

- Get booking action: add validation that bookingId and apiKey are not empty
- Get booking action: add validation of response data to make sure we have data points

## April 27, 2023

- Get booking action: `startTime` and `endTime` data points are now of value type `date` instead of `string`.
