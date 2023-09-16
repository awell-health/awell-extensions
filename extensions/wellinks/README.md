---
title: Wellinks
description: The purpose of this extension is to keep application logic out of the Pathways and Tracks. Some actions require interactions with the Healthie API, hence the need for the API URL and Key in the settings.
---
# Wellinks Extension

The purpose of this extension is to keep application logic out of the Pathways and Tracks. Some actions require interactions with the Healthie API, hence the need for the API URL and Key in the settings.

## Extension Settings

You will need to provide the API URL and Key for the Wellinks Healthie instance.

# Custom Actions

## Check for Override

Checks to see if the patient in Healthie has an active Override form.

## Check for Scheduled Appointments

Checks to see if the patient in Healthie has an appointment of a specific type scheduled in the future.

## Check for Chat

Checks that a Chat message (either to or from a patient and coach) has happened at least 24 hours after an appointment

## Insert Member List Event

Adds an Insert Member List Event to the Platform Database.

## Check for Flourish Customer

Queries Flourish to see if there is a record that has a matching ThirdPartyIdentifier. Returns True/False.