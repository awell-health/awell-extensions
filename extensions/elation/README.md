---
title: Elation
description: Elation is a cloud-based health record system designed for healthcare providers, clinics, and medical practices.
---
# Elation

Elation is a cloud-based health record system designed for healthcare providers, clinics, and medical practices. It offers a range of features including patient scheduling, charting, e-prescribing, billing, and telemedicine. Overall, Elation is designed to streamline the workflow of medical practices, improve patient care, and increase efficiency.

## Setup

### Webhooks

The integration of webhooks with Elation presents unique challenges and considerations:

- **Non-Discriminative Triggers**: Elation does not differentiate between the creation or update of a resource. Both actions will set off webhook with action `saved`, which might not provide enough discriminative information for some use cases.
- **Programmatic Setup**: Elation webhooks can only be configured programmatically, as there's no dedicated user interface in Elation to set up webhooks. View [this demo video](https://youtu.be/v8u6E8MEI8E) for a step-by-step guide on how to set up your webhooks in Elation.
- **Limitation on user-triggered actions**: Elation has a concept called "Preventing echo". This means that that any action carried out by the user affiliated with the API credentials that created the subscription doesn't trigger a webhook. You can read more about this behaviour [here](https://docs.elationhealth.com/reference/webhooks). If you are not receiving any webhooks from Elation after setting up your subscription, then this is the reason. A feasible workaround to the above limitation is creating a dedicated user not meant for human interactions but serves the sole purpose of facilitating M2M communication.

If you need help setting up your webhooks in Elation, reach out! We are happy to help you.

### Extension settings

In order to use this extension you will need to provide the extension with the following settings:

- Base URL / endpoint URL of the API
- Authorization URL
- Client ID for OAuth2 Password authentication
- Client Secret for OAuth2 Password authentication
- API Username for OAuth2 Password authentication
- API Password for OAuth2 Password authentication

Not sure where you can find all of this information? Click [here](https://docs.elationhealth.com/reference/introduction) to have a look at Elation's Developer documentation.

## Actions

The following actions are supported with Elation today:

### Create Patient

This action creates a patient in Elation.

**When creating a patient, you will have to specifiy the primary physician and caregiver practice ID:**
- Primary physician ID: you can retrieve this ID by using the [Find Physicians](https://docs.elationhealth.com/reference/find-physicians) API call, or by using the `Find Physician` action
- Caregiver Practice ID: similar to the primary physician ID, you can find this ID by using the same API call or action

### Get Patient

Using a patient identifier, retrieve a patient object from Elation. 

Note that when retrieve the mobile phone number, we are tranforming the number to an international format. We apply a heuristic and assume all mobile numbers in Elation are in US national format so we prepend the number with the +1 country code. Having the number in international format unlocks more powerful functionality like sending text messages with 3rd party services like Twilio and MessageBird.

### Update Patient

Update a patient in Elation using any fields available in create patient. We use Elation's `PATCH` method to apply partial modifications to a the patient resource (i.e. update only what is needed).

### Create Appointment

Easily create a patient appointment in Elation.

Creating an appointment requires a few strings to be well-formulated:
- `Scheduled date` must be a datetime string (ISO-8601). For example, January 1, 2023 at noon, Pacific Time (-8 hours) would be shown as such: `2023-01-01T12:00:00.000-08:00`
- `Reason` must not be free text. This value comes from the following list of appointment types (`Follow-Up`, `Office Visit`, `Physical Exam`, etc.):
![Appointment types](./assets/elation-appointment-reason.png?raw=true "Elation Appointment Types")
- `Patient` is the patient ID.
- `Physician` is the physician ID (see `Find Physician`)
- `Practice` is the practice ID (again, see `Find Physician`)

You can also include a duration (default to 15 minutes, or whatever has been set in your EHR)

### Get Appointment

Retrieve appointment details using an appointment ID. 

### Create Non-Visit Note

The non-visit note is a special kind of note that, as the name suggests, is not associated with a visit. These notes, in their simplest form, provide a chronological account of information about the patient.

**Additional documentation for some of the action fields:**
1. Category: The default category is "Problem" but you can choose any of "Past", "Family", "Social", "Instr", "PE", "ROS", "Med", "Data", "Assessment", "Test", "Tx", "Narrative", "Followup", "Reason", "Plan", "Objective", "Hpi", "Allergies", "Habits", "Assessplan", "Consultant", "Attending", "Dateprocedure", "Surgical", "Orders", "Referenced", "Procedure".
2. Chart and document date automatically get set to the current date, i.e. the date when the action is orchestrated.

### Delete Non-Visit Note

Deletes the non-visit note identified by an ID.

### Get Non-Visit Note

Retrieve the details of a non-visit note identified by an ID.
### Get physician

Using a physician identifier, retrieve a physician object from Elation.

### Find physicians

Search a physician based on a set of parameters. The ID of the physician matching the search parameters will be returned. To retrieve the details of the physician, you can use the the "Get physician" action.

Note that this action can only support finding one physician so if your search criteria match multiple physicians the action will throw an error.

### ✨ Find Future Appointment

Tries to find a **single future appointment** for a patient based on a prompt in natural language. These are the steps executed by the action:

1. All future appointments with status `Scheduled` or `Confirmed` for the patient are retrieved from Elation.
2. Based on the provided prompt, an LLM tries to find a single appointment from the list of future appointments that matches the prompt.
3. If multiple appointments exist that match the instructions, only the first one is returned.

If a matching appointment is found, the action returns the full appointment resource and an explanation of why the LLM chose this appointment.

### ✨ Find Appointments

Tries to find **all appointments** for a patient based on a prompt in natural language. These are the steps executed by the action:

1. All appointments, independent their date or status, for the patient are retrieved from Elation.
2. Based on the provided prompt, an LLM tries to find all appointments from the list appointments that matches the prompt.

The action returns the full appointment resources of all appointments matching the prompt and an explanation of why the LLM chose these appointments. Additionally, the action returns a count of appointments by status.

Example data points output below.

Appointments (note: only displaying a partial appointment resource)```json
[
  {
    "id": 456,
    "scheduled_date": "2023-07-12T20:44:22Z",
    "status": {
      "status": "Scheduled",
    },
  },
  {
    "id": 456,
    "scheduled_date": "2023-08-12T20:44:22Z",
    "status": {
      "status": "Confirmed",
    },
  }
]```

Appointment counts by status
```json
{
  "Scheduled": 1,
  "Confirmed": 1,
}
```

### ✨ Update Patient Tags

Uses AI to manage patient tags in Elation based on natural language instructions. The action executes the following steps:

1. Retrieves existing patient tags from Elation
2. Uses an LLM to interpret natural language instructions and determine required tag changes
3. Updates patient tags in Elation according to the interpreted changes

The action returns:
- Complete list of updated tags after changes
- Detailed explanation of what changes were made and why

**Important Notes:**
- When adding new tags, specify them in single quotes (e.g., 'Diabetes', 'High-Risk'). Tags must exist in your Elation database
- Due to Elation API limitations, clearing all tags is implemented by setting a single space tag (' '). This is the recommended workaround from Elation's team

### ✨ Cancel appointments

Given a prompt, this action retrieves a patient's upcoming appointments matching the prompt and cancels them.
