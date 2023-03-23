# What is Healthie?

## Healthie x Awell

# Extension settings

In order to set up this extension, **you will need to provide a Healthie API key and Api url**. You can obtain an API key via the Healthie portal (`Settings > Developer > API keys`). You can obtain API url in the [DOCUMENTATION](https://docs.gethealthie.com/docs/#environments) in `Environments` section.

# Custom Actions

## Send chat message action

Sends a chat message to a patient in name of the provided provider ID. Will create a new conversation if no active conversation between patient and provider exists or sends a message in an existing conversation if there is an active conversation between the two.

## Create patient

Creates a new patient set up according to the passed fields. After completion the following data points will be available:

1. healthiePatientId

## Update patient
Updates a specific patient (defined by the provided `id`) according to the passed fields.

## Apply tag to patient
Adds a tag (existing one, identified by an `id`) to a patient. Although the Healthie API call allows assigning multiple tags per API call, for simplicity of the logic this action can only take one tag as input. Assigning multiple tags is possible by adding multiple actions.

## Remove tag from patient
Removes a tag (identified by an `id`) from a patient.

# Pricing

# Limitations
