# Elation Changelog

## January 30, 2024

- New actions
  - Post letter: Using patient and practice identifier, post a new letter to either Provider, Patient or associate it with an existing Referral.

## October 3, 2023

- The README is now more concise with less unneeded detail. A section on the particularities of Elation subscriptions (webhooks) was added.
- Misc. updates to labels, descriptions, action fields order
- Action updates
  - Create Non-Visit Note:
    - Simplify the action by removing some optional action fields (we can always expand later)
    - `document_date` and `chart_date` are now automatically set to the date of today so that the corresponding action fields could be removed
  - Create patient
    - `dob` is now a `date` field type (was a string)
    - You can pass a mobile phone number and email when creating a patient
  - Find physician
    - Only returns the physician ID instead of all the details of the physician. To retrieve the details one can use the new `Get physician` action
  - Update patient
    - `dob` is now a `date` field type (was a string)
    - We are now using `PATCH` instead of `PUT` which allows for a partial update, i.e. only update the fields that are needed.
- New actions
  - Get physician: Using a physician identifier, retrieve a physician object from Elation.
- Removed actions
  - Update Non-Visit Note
- Webhooks
  - Fix the type of `patientId` in `patientCreatedOrUpdated` webhook
  - Added `appointmentCreatedOrUpdated` webhook

## September 4, 2023

- rename `onCreatePatient` webhook to `patientCreatedOrUpdated`
- filter non `saved` actions for this webhook

## August 21, 2023

- make non-visit note text a large input (`StringType.TEXT`)

## May 23, 2024

- add patient_status.status to patient object in getPatient action
- add status to updatePatient action
