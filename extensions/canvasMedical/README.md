---
title: Canvas Medical
description: Canvas Medical is a healthcare platform that empowers care delivery companies to revolutionize digital health experiences for their patients and users.
---

# Canvas Medical

Canvas Medical is a healthcare platform that empowers care delivery companies to revolutionize digital health experiences for their patients and users. Leveraging certified EHR as a foundation, Canvas Medical offers a comprehensive suite of APIs, enabling customers to swiftly launch innovative patient experiences and cost-effective business models.

Canvas Medical provides appointment management, patient data creation and updates, task management, questionnaire creation, and much more.

## Extension settings

For the extension to function correctly, you must include the following elements in your settings:

`client_id` and `client_secret`: These values are generated on the Canvas Medical platform.
`base_url`: This determines the base URL for your FHIR endpoint.
`auth_url`: This determines the base URL for your authorization endpoint.

### Create appointment

Easily schedule appointments with providers using the Canvas API. This action allows you to reserve a meeting with a healthcare provider by submitting `appointmentData` in JSON format. Upon successful execution, the data points returns the unique `appointmentId`, serving as the key within the Canvas API object.

### Create patient

Effortlessly create patients using the Canvas API. This action allows you to generate a new patient record by submitting `patientData` in JSON format. Upon successful execution, the data points returns the unique `patientId`, serving as the key within the Canvas API object.

### Create task

Efficiently create tasks associated with a specific patient using the Canvas API. This action allows you to generate a new task linked to a designated patient by submitting `taskData` in JSON format. Upon successful execution, the data points returns the unique `taskId`, serving as the key within the Canvas API object.

### Create questionnaire responses

Create questionnaire responses using the Canvas API to effortlessly record answers within an existing questionnaire. This action requires several parameters:

- `Questionnaire ID`: Reference to the Canvas Questionnaire using the questionnaire id.
- `Subject ID`: Reference to the Canvas Patient using the patient id.
- `Authored`: Timestamp when the Questionnaire response was filled out (If omitted, the current timestamp at data ingestion will be used).
- `Author ID`: Reference to the patient or practitioner filling out the questionnaire. If omitted, it defaults to Canvas Bot.
- `Item`: List of answers to questions in the questionnaire.

Upon successful execution, the data points returns `questionnaireResponseId`, which serves as the key within the Canvas API object.

### Update appointment

Effortlessly cancel or modify a reserved appointment using the Canvas API. This action allows you to update appointment details by submitting `appointmentData` in JSON format. Upon successful execution, the data points returns the `appointmentId`, serving as the key within the Canvas API object.

### Update patient

Efficiently update existing patient information within the system using the Canvas API. This action allows you to modify data by submitting `patientData` in JSON format. Upon successful execution, the data points returns the `patientId`, which serves as the key within the Canvas API object

### Update task

Efficiently update existing task information within the system using the Canvas API. This action allows you to modify data by submitting `taskData` in JSON format. Upon successful execution, the action returns the `taskId`, which serves as the key within the Canvas API object.

### Create coverage

Efficiently create a coverage using the Canvas API. This action requires several parameters:

- `Order`: Specifies the order in which insurance coverages should be utilized when processing claims.
- `Status`: Refers to the statuses represented within the Canvas Medical system.
- `Type`: Pertains to the Insurance Coverage Code Category, such as medical or accident, using values from http://hl7.org/fhir/ValueSet/coverage-type.
- `Subscriber`: Refers to the Canvas Patient using the patient ID, serving as the resource for the coverage's subscriber.
- `Subscriber ID`: Refers to the Canvas Patient using the patient ID.
- `Beneficiary`: Specifies the intended patient for the coverage.
- `Relationship`: Relates to the beneficiary's relationship to the subscriber, as defined in the http://hl7.org/fhir/ValueSet/.
- `Period start`: Indicates when the coverage became active for the patient.
- `Period end`: Indicates when the coverage ceased to be active for the patient.
- `Payor`: Relates to the entity responsible for payment.
- `Class`: Utilized to define the plan, subplan, group, and subgroup.

### Update coverage

Efficiently update existin coverage using the Canvas API. This action requires several parameters:

- `Id`: Reference to the Canvas Coverage using the coverage id.
- `Order`: Specifies the order in which insurance coverages should be utilized when processing claims.
- `Status`: Refers to the statuses represented within the Canvas Medical system.
- `Type`: Pertains to the Insurance Coverage Code Category, such as medical or accident, using values from http://hl7.org/fhir/ValueSet/coverage-type.
- `Subscriber`: Refers to the Canvas Patient using the patient ID, serving as the resource for the coverage's subscriber.
- `Subscriber ID`: Refers to the Canvas Patient using the patient ID.
- `Beneficiary`: Specifies the intended patient for the coverage.
- `Relationship`: Relates to the beneficiary's relationship to the subscriber, as defined in the http://hl7.org/fhir/ValueSet/.
- `Period start`: Indicates when the coverage became active for the patient.
- `Period end`: Indicates when the coverage ceased to be active for the patient.
- `Payor`: Relates to the entity responsible for payment.
- `Class`: Utilized to define the plan, subplan, group, and subgroup.

### Create claim

Create claim using the Canvas API. This action requires several parameters:

- `status`: Status compliant with Canvas Medical.
- `type`: Type compliant with Canvas Medical.
- `patientId`: Reference to the Canvas Patient using the patient id.
- `created`: The field indicating when this claim resource was created
- `provider`: The field related to determining personnel resources for services in the statement
- `supportingInfo`: Supporting info compliant with Canvas Medical.
- `diagnosis`: The field represents the list will create the Assessments in Canvas for this claim.
- `insurance`: The field represents the list of elements that defines what coverages are to be used when adjudicating the claim.
- `item`: The field represents the list of service charges to be used in the claim.

Upon successful execution, the data points returns `claimId`, which serves as the key within the Canvas API object.

