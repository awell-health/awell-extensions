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

If the Elation API throws an error indicating the patient with the provided information already exists, the action will succeed and the ID of the existing patient will be returned.

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

This AI-powered action finds a **single future appointment** for a patient based on a prompt in natural language. Just type something like "next cardiology appointment" — AI figures it out and finds the matching appointment for you.

**How it works:**
1. All future appointments with status `Scheduled` or `Confirmed` for the patient are retrieved from Elation.
2. Based on the provided prompt, an LLM tries to find a single appointment from the list of future appointments that matches the prompt.
3. If multiple appointments exist that match the instructions, only the first one is returned.

**What it needs (Inputs):**
- `Elation patient ID` (Required): The numeric ID of the patient in Elation whose appointments you want to search.
- `Describe what appointment you would like to find` (Required): A natural language description of the appointment you're looking for. Be as specific as possible about the type, status, timing, or any other important aspect for your use case.

**What it gives back (Outputs):**
- `Appointment`: The complete appointment data in JSON format (if found).
- `Appointment Exists`: Boolean indicator (true/false) of whether a matching appointment was found.
- `Explanation`: A clear explanation of why the selected appointment was chosen or why no appointment was found.

**Tips for best results:**
- Include specific details about the appointment type, status, or purpose in your description.
- Use single or double quotes for exact matches. For example, if you search for '"Physical Exam"', the action will search for appointments with that exact appointment type (with small variations physical exams, Physical exam).
- When you know exactly what to match (status, physician name, appointment type), put it in quotes (e.g., '"Scheduled"', '"Follow-Up"') for exact matching.
- For other criteria where you're less certain, provide descriptive instructions without quotes, for example all physical exams - then AI action will try to find all exams that can be classified as physical exams.
- Time-based instructions work well, such as "next week," "this month," or "next Thursday."
- If multiple appointments match your criteria, only the first one will be returned.
- Be clear and specific in your instructions to avoid ambiguity - this is critical for getting accurate results.

**Example:**
```
Input:
  Elation patient ID: 12345
  Describe what appointment you would like to find: "Find my next video appointment with status 'Confirmed' for 'Follow-Up'"

Output:
  Appointment: {
    "id": 67890,
    "scheduled_date": "2023-08-15T14:30:00Z",
    "status": {
      "status": "Confirmed"
    },
    "mode": "VIDEO",
    "reason": "Follow-Up"
  }
  Appointment Exists: true
  Explanation: "I found a video appointment scheduled for August 15, 2023 at 2:30 PM. The appointment is confirmed and is for a Follow-Up visit, which matches your search criteria. This is the earliest upcoming confirmed video appointment for a follow-up."
```

### ✨ Find Appointments

This AI-powered action finds **all appointments** for a patient based on a prompt in natural language. Want to know how many mental health sessions someone has had this year? Just ask — AI returns them all.

**How it works:**
1. All appointments, independent of their date or status, for the patient are retrieved from Elation.
2. Based on the provided prompt, an LLM tries to find all appointments from the list of appointments that match the prompt.

**What it needs (Inputs):**
- `Elation patient ID` (Required): The numeric ID of the patient in Elation whose appointments you want to search.
- `Describe the appointments to search for` (Required): A natural language description of the appointments you're looking for. Be as specific as possible about appointment types, timing, status, or other criteria.

**What it gives back (Outputs):**
- `Appointments`: Array of appointment objects that match your search criteria (in JSON format).
- `Explanation`: A detailed explanation of why these appointments were selected, including the reasoning behind the matches.
- `Appointment Counts By Status`: A summary of how many matching appointments were found in each status category (e.g., "Scheduled": 2, "Completed": 1).

**Tips for best results:**
- When you know exactly what to match (status, appointment type), put it in quotes (e.g., '"Scheduled"', '"Office Visit"') for exact matching.
- For other criteria where you're less certain, provide descriptive instructions without quotes.
- Include specific time ranges, such as "all appointments in 2023" or "appointments from January to March" when relevant.
- Filter by appointment status: "Cancelled," "Completed," "Scheduled," or "Confirmed" when relevant.
- Be clear and specific in your instructions and avoid ambiguity - this is critical for getting accurate results.

**Example:**
```
Input:
  Elation patient ID: 12345
  Describe the appointments to search for: "Find all completed appointments with type 'Physical Exam' in the last 6 months"

Output:
  Appointments: [
    {
      "id": 67890,
      "scheduled_date": "2023-06-10T13:00:00Z",
      "status": {
        "status": "Completed"
      },
      "reason": "Physical Exam",
      "mode": "IN_PERSON"
    },
    {
      "id": 67891,
      "scheduled_date": "2023-03-15T09:30:00Z",
      "status": {
        "status": "Completed"
      },
      "reason": "Physical Exam",
      "mode": "IN_PERSON"
    }
  ]
  Explanation: "I found 2 completed physical exam appointments in the last 6 months. The first appointment was on June 10, 2023, and the second appointment was on March 15, 2023. Both appointments were in-person and are marked as completed in the system."
  Appointment Counts By Status: {
    "Completed": 2
  }
```

### ✨ Cancel Appointments

This AI-powered action uses AI to identify and cancel patient appointments based on natural language instructions. You can say, "All follow-up appointments for next week" and AI will identify and cancel the right ones for you.

**How it works:**
1. Retrieves all upcoming appointments for the patient from Elation
2. Uses an LLM to interpret the prompt and identify which appointments should be canceled
3. Processes the cancellation for matched appointments and handles partial success scenarios

**What it needs (Inputs):**
- `Elation patient ID` (Required): The numeric ID of the patient in Elation whose appointments you want to cancel.
- `Describe the appointments you would like to cancel` (Required): Natural language instructions describing which appointments should be canceled. Be specific about criteria such as time period, appointment type, or provider.

**What it gives back (Outputs):**
- `Cancelled Appointments`: An array of appointment IDs that were successfully canceled.
- `Explanation`: A detailed explanation of which appointments were canceled and why they matched your criteria.

**Tips for best results:**
- Use single or double quotes for exact matches. For example, '"Follow-Up"' will only match appointments with exactly that type.
- When you know exactly what to match (appointment type, status), put it in quotes (e.g., '"Scheduled"', '"Physical Exam"') for exact matching.
- For other criteria where you're less certain, provide descriptive instructions without quotes.
- Be specific about the time frame: "all appointments this week," "appointments in July," etc.
- You can target specific appointment types: "all physical therapy appointments," "follow-up visits", etc.
- Only future appointments with status "Scheduled" or "Confirmed" can be canceled.
- If no appointments match your criteria, the action will explain why nothing was canceled.
- For safety, highly specific criteria are recommended to avoid unintended cancellations.
- Be clear and specific in your instructions to avoid ambiguity - this is critical for preventing accidental cancellations.

**Example:**
```
Input:
  Elation patient ID: 12345
  Describe the appointments you would like to cancel: "All appointments with status 'Scheduled' for office visits in the next two weeks."

Output:
  Cancelled Appointments: [67890, 67891]
  Explanation: "I canceled 2 appointments based on your request:
  1. Appointment #67890: Scheduled for June 5, 2023 at 2:00 PM, type: Office Visit
  2. Appointment #67891: Scheduled for June 12, 2023 at 10:30 AM, type: Office Visit
  
  Both appointments were within the next two weeks and match the 'Office Visit' type and 'Scheduled' status as specified. The appointments were successfully canceled in the system and will need to be rescheduled after the patient returns from vacation."
```

### ✨ Update Patient Tags

This AI-powered action uses AI to manage patient tags in Elation based on natural language instructions. Want to mark someone for special attention? Just say it, and AI updates their tags in Elation.

**How it works:**
1. Retrieves existing patient tags from Elation
2. Uses an LLM to interpret natural language instructions and determine required tag changes
3. Updates patient tags in Elation according to the interpreted changes

**What it needs (Inputs):**
- `Elation patient ID` (Required): The numeric ID of the patient in Elation whose tags you want to update.
- `Specify tags to add, remove, or modify` (Required): Natural language instructions explaining what tag changes you want to make. Be specific about which tags to add, remove, or modify.

**What it gives back (Outputs):**
- `Updated Tags`: A comma-separated list of all patient tags after your requested changes have been applied.
- `Explanation`: A detailed explanation of what changes were made to the tags and why.

**Tips for best results:**
- When specifying new tags to add, use single quotes around tag names (e.g., 'Diabetes', 'High-Risk') for exact matching.
- Case sensitivity and exact spelling matter when using quotes - 'Diabetes' and 'diabetes' will be treated as different tags.
- Be explicit about which tags to remove or replace (e.g., "Remove the 'Temporary' tag").
- You can include context to help the AI understand why tags are being modified.
- To clear all tags, you can say "Remove all tags" or "Clear all existing tags."
- Due to Elation API limitations, clearing all tags is implemented by setting a single space tag (' '). This is the recommended workaround from Elation's team.
- Tags must already exist in your Elation database to be added.
- Be clear and specific in your instructions to avoid ambiguity - this is critical for getting accurate results.

**Example:**
```
Input:
  Elation patient ID: 12345
  Specify tags to add, remove, or modify: "Add the tags 'Diabetes' and 'CCM Program'. Remove the 'Inactive' tag if it exists."

Output:
  Updated Tags: "Diabetes, CCM Program, Hypertension"
  Explanation: "I've made the following changes to the patient's tags:
  1. Added 'Diabetes' tag as requested
  2. Added 'CCM Program' tag as requested
  3. No 'Inactive' tag was found, so no removal was necessary
  4. The existing 'Hypertension' tag was preserved"
```

### ✨ Check Patient Tags

This AI-powered action uses AI to check if a patient's tags match given instructions in natural language. Ask "Is this patient marked as 'Diabetic' or 'Obese'?" — AI checks and explains the answer.

**How it works:**
1. Retrieves existing patient tags from Elation
2. Uses an LLM to interpret natural language instructions and check if the patient's tags match the requirements
3. Returns a boolean result and explanation of the check

**What it needs (Inputs):**
- `Elation patient ID` (Required): The numeric ID of the patient in Elation whose tags you want to check.
- `Instructions for checking tags` (Required): Natural language instructions explaining what tag conditions you want to verify. Be specific about what tags should or shouldn't be present.

**What it gives back (Outputs):**
- `Tags Found`: Boolean (true/false) indicating whether the patient's tags match your specified criteria.
- `Explanation`: A detailed explanation of why the tags match or don't match your criteria, including which tags were found or missing.

**Tips for best results:**
- When specifying exact tag matches, use double quotes around tag names (e.g., "Diabetes", "High-Risk") for exact matching.
- Case sensitivity and exact spelling matter when using quotes - "Diabetes" and "diabetes" will be treated as different tags.
- You can use logical operators in your instructions, such as AND, OR, NOT (e.g., "Check if the patient has 'Diabetes' AND 'Hypertension' tags").
- Complex conditions are supported, like "either/or", "both", "not", "any of", "none of".
- Be precise about what combination of tags you're looking for to get accurate results.
- The action provides reasoning about why the criteria was or wasn't met, which can be useful for debugging or explaining decisions.
- Be clear and specific in your instructions to avoid ambiguity - this is critical for getting accurate results.

**Example:**
```
Input:
  Elation patient ID: 12345
  Instructions for checking tags: "Check if the patient has the tag 'CCM Program' but does not have the tag 'Excluded'. They need to be in the CCM program without exclusions to be eligible for our new service."

Output:
  Tags Found: true
  Explanation: "The patient meets the specified criteria. They have the 'CCM Program' tag, indicating enrollment in the Chronic Care Management program. They do not have the 'Excluded' tag. The patient's complete tag list is: CCM Program, Diabetes, Hypertension. Based on these tags, the patient is eligible for the new service as they are in the CCM program without exclusions."
```


