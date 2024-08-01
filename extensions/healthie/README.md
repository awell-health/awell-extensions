---
title: Healthie
description: Healthie offers infrastructure for next generation digital health organizations that provide virtual-first care.
---

# What is Healthie?

Healthie offers infrastructure for next generation digital health organizations that provide virtual-first care. Healthie’s API-first and fully brandable suite of solutions (Scheduling, EMR, Client Engagement) enables healthcare builders to launch and scale best-in-class experiences for their members. Healthie also offers a built-in marketplace of business and clinical integrations used by our organizations.

To learn more, visit [www.gethealthie.com](https://refer.gethealthie.com/dejebp5gm06x).

## Healthie x Awell

With this extension, organizations are able to build clinical workflows in Awell’s low-code platform and easily integrate them into Healthie. By doing so, Healthie’s customers can automate routine clinical tasks, synchronize data between systems and drive seamless coordination between care team and patients.

By combining Healthie’s web and mobile platform with our clinical workflows, clinicians will be able to provide the right care, at the right time for the right patient.

# Extension settings

In order to set up this extension, **you will need to provide a Healthie API key and Api url**. You can obtain an API key via the Healthie portal (`Settings > Developer > API keys`). You can obtain API url in the [DOCUMENTATION](https://docs.gethealthie.com/docs/#environments) in `Environments` section.

Please note that the extension automatically prefixes the API key with `Basic ` so please provide your raw API key without `Basic ` in front.

# Custom Actions

## Send chat message action

Sends a chat message to a patient in name of the provided provider ID. Will create a new conversation if no active conversation between patient and provider exists or sends a message in an existing conversation if there is an active conversation between the two.

## Create patient

Creates a new patient according to the passed fields. After completion the `healthiePatientId` will be exposed as a data point in the care flow.

## Update patient

Updates a specific patient (defined by the provided `id`) according to the passed fields.

## Apply tag to patient

Adds a tag (existing one, identified by an `id`) to a patient. Although the Healthie API call allows assigning multiple tags per API call, for simplicity of the logic this action can only take one tag as input. Assigning multiple tags is possible by adding multiple actions.

## Remove tag from patient

Removes a tag (identified by an `id`) from a patient.

## Create charting note

Creates a charting note with the provided `note_content`.

**Prerequisites and set-up:**

1. The form specified by the `form_id` exists in Healthie.
2. The form specified by the `form_id` is a charting form (click "Convert to charting form" in the form options).
3. The form contains at least one question of type `textarea` (long text answer). The action will write the content of the charting note in the first question of that type it finds in the form.

## Send form completion request

Send a form completion request to the patient. You will need the Healthie patient ID and the ID of the form you would like the patient to complete.

Although the Healthie API call allows sending form completion requests to multiple users per API call (see recipient_ids in their docs), we decided that every action only sends one form completion request. This heavily simplifies the logic and better fits our domain model (1-to-1 relationship between patient and pathway). If a user would like to send multiple form completion requests, they you can just add multiple actions.

## Archive patient

Archives a patient with a given `id`.

## Create location

Creates a location. ID of the created location is stored as `locationId` data point.

## Close chat conversation

Closes chat conversation with a given `id` as a provider with the given `provider_id`.

## Delete appointment

Deletes an appointment with a given `id`.

## Cancel appointment

Cancels an appointment with a given `id`.

## Get metric entry

Retrieve the most recent metric entry from a given `category`.

## Create metric entry

Create a metric entry for a patient in Healthie. The category of the metric is the literal name of the metric in Healthie. So if you have a metric in Healthie called "Weight", you should use "Weight" as the category.

## Check patient tag

Checks that a patient has an active tag with given `id`

## Check scheduled appointments

Checks that a patient has active scheduled appointment with given `appointmentTypeId`

## Get form answers

This action will retrieve the form answers for a answer group with a given ID. The complete form answers object will be stored as JSON and will be available in Awell Studio as a data point

Example of a form answers response:

```json
[
  {
    "id": "640",
    "label": "Please enter some information about the person who referred you.",
    "answer": ""
  },
  {
    "id": "641",
    "label": "Name",
    "answer": "Chris"
  }
]
```

Derrived data points can be used to then store the answer of a specific question in a data point. You can use the following JSONPath expression to retrieve the answer for a given question ID: `$[?(@.id == '<ID>')].answer`