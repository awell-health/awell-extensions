---
title: Customer.io
description: Customer.io is a customer engagement platform designed to create personalized customer journeys that engage, convert, and scale.
---

## Customer.io

Customer.io is a customer engagement platform designed to create personalized customer journeys that engage, convert, and scale.

## Settings and setup

To start using the Customer.io extension, you need to create an account and get your API key and site ID.

## Actions

### Track person event

Tracks an event for a person in Customer.io. You can identify a person using `email`, `cio_id` or `id`, give your event a name and optional attributes.

By default, Awell adds the following attributes to the event:

- `_awell_careflow_id`: The ID of the careflow.
- `_awell_careflow_definition_id`: The ID of the careflow definition.
- `_awell_patient_id`: The ID of the patient.
- `_awell_activity_id`: The ID of the activity.
- `_awell_identifier_{system_namespace}`: For every identifier the patient has in Awell, an attribute is added with the system namespace as the key and the identifier value as the value.

