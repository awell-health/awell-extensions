# Awell Virtual (AI) Assistant - Ava

## Extension settings

In order to set up this extension, you will need to provide an Open AI API key.

## Custom Actions

### Generate patient summary

Generates a human-readable summary about the patient based on the characteristics in the patient's profile.

You can specify which characteristics of the patient you would like to include by providing a comma-separated string with the below possible options:

- first_name
- last_name
- street
- city
- country
- state
- zip
- birth_date
- email
- mobile_phone
- phone
- national_registry_number
- patient_code
- preferred_language
- sex

If no characteristics are passed, by default a summary will be generated that includes all characteristics.
