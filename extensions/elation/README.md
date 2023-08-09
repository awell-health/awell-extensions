---
title: Elation Sign
description: Elation is a cloud-based health record system designed for healthcare providers, clinics, and medical practices.
---
# Elation

Elation is a cloud-based health record system designed for healthcare providers, clinics, and medical practices. It offers a range of features including patient scheduling, charting, e-prescribing, billing, and telemedicine. Overall, Elation is designed to streamline the workflow of medical practices, improve patient care, and increase efficiency.

## Extension settings

In order to use this extension you will need to provide the extension with the following settings:

- Base URL / endpoint URL of the API
- Authorization URL
- Client ID for OAuth2 Password authentication
- Client Secret for OAuth2 Password authentication
- API Username for OAuth2 Password authentication
- API Password for OAuth2 Password authentication

## Actions

The following actions are supported with Elation today:

### Create Patient

Create a patient in the EHR. **Does not look for duplicates**

Required fields include:
- First Name
- Last Name
- Date of Birth (YYYY-MM-DD)
- Sex (Male, Female, Other, Unknown)
- Primary Physician (the ID of the physician, which you will be able to retrieve using the [Find Physicians](https://docs.elationhealth.com/reference/find-physicians) API call, or by using the `Find Physician` action)
- Caregiver Practice (the ID of the practice. Again, you can find using the same API call or action as listed above)

There are also a number of optional fields.

**NOTE: We currently do not support nested objects, so the entire patient object supported by elation's API is not yet exposed**. Please reach out to us if you're looking to add a particular field or set of fields.

### Get Patient

Using a patient identifier, get a patient object that has all datapoints listed above in `Create Patient`.

**NOTE: Because we don't yet support nested objects and arrays in extensions, we expose specifically the `mobile_phone` field, which is a search for the patient's mobile phone specifically.**

### Update Patient

Update a patient using any fields available in create patient.

Oddly enough, the following fields are always required by Elation:
- first_name
- last_name
- dob
- sex
- primary_physician
- caregiver_practice

![Postman request](./assets/elation-update-patient.png?raw=true "Bad Update Patient Request")

### Create Appointment

Create a patient appointment in your EHR for a given practice and physician.

Creating an appointment requires a few strings to be well-formulated:
- `Scheduled date` must be a datetime string (ISO-8601). For example, January 1, 2023 at noon, Pacific Time (-8 hours) would be shown as such: `2023-01-01T12:00:00.000-08:00`
- `Reason` must not be free text. This value comes from the following list of appointment types (`Follow-Up`, `Office Visit`, `Physical Exam`, etc.):
![Appointment types](./assets/elation-appointment-reason.png?raw=true "Elation Appointment Types")
- `Patient` is the patient ID.
- `Physician` is the physician ID (see `Find Physician`)
- `Practice` is the practice ID (again, see `Find Physician`)

You can also include a duration (default to 15 minutes, or whatever has been set in your EHR)

### Get Appointment

Get an appointment using an appointment ID. View all of the fields supported by the API.

### Create Non-Visit Note

The non-visit note is a special kind of note that, as the name suggests, is not associated with a visit. These notes, in their simplest form, provide a chronological account of information about the patient.

### Update Non-Visit Note

Updates the non-visit note identified by an ID. Only ID is required by default, however editing any of `text`, `author` or `category` requires `Bullet ID` and both `text` and `author` to be provided.

### Delete Non-Visit Note

Deletes the non-visit note identified by an ID.

### Get Non-Visit Note

Gets the non-visit note identified by an ID. Fields are saved as data points:
- `authorId`
- `text`
- `chartDate`
- `documentDate`
- `patientId`
- `practiceId`
- `tags` (comma-separated list)