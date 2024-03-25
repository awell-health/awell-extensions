---
title: Athena
description: Athena offers medical groups, hospitals, and health systems cloud-based EHR, practice management, and patient engagement services that seamlessly connect care and drive results for every client. 
---

## Athenahealth

Athena offers medical groups, hospitals, and health systems cloud-based EHR, practice management, and patient engagement services that seamlessly connect care and drive results for every client.

## Extension settings

For the extension to function correctly, you must configure the following settings:

- Auth server URL (e.g. https://api.preview.platform.athenahealth.com/oauth2/v1/token)
- Client ID
- Client secret
- API URL (https://api.preview.platform.athenahealth.com)
- Scope
- Practice ID


## Actions

### Create patient

Creates a patient in athenahealth. First name, last name, date of birth, email, and department ID are required. If a patient with the same name, date of birth, and email already exists, a new patient record will not be created. Instead, the existing patient's ID will be returned.

### Get patient

Retrieve the details of a given patient within a given practice.

### Get appointment

Retrieve the details of an appointment.

### Create appointment note

Create a note which will be appended to an appointment