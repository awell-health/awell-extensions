/* eslint-disable @typescript-eslint/naming-convention */
import {
  FieldType,
  NumericIdSchema,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { updatePatientSchema } from '../validation/patient.zod'
import { isEmpty, isNil, union } from 'lodash'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient in Elation',
    type: FieldType.NUMERIC,
    required: true,
  },
  firstName: {
    id: 'firstName',
    label: 'First Name',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  dob: {
    id: 'dob',
    label: 'Date of Birth',
    description: 'YYYY-MM-DD',
    type: FieldType.DATE,
    required: false,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description: "Possible values are 'Male', 'Female', 'Other', 'Unknown'",
    type: FieldType.STRING,
    required: false,
  },
  primaryPhysicianId: {
    id: 'primaryPhysicianId',
    label: 'Primary Physician ID',
    description: 'The ID of the primary physician associated to the patient',
    type: FieldType.NUMERIC,
    required: false,
  },
  caregiverPracticeId: {
    id: 'caregiverPracticeId',
    label: 'Caregiver Practice ID',
    description: '',
    type: FieldType.NUMERIC,
    required: false,
  },
  middleName: {
    id: 'middleName',
    label: 'Middle Name',
    description: '',
    type: FieldType.STRING,
  },
  actualName: {
    id: 'actualName',
    label: 'Actual Name',
    description: '',
    type: FieldType.STRING,
  },
  genderIdentity: {
    id: 'genderIdentity',
    label: 'Gender identity',
    description:
      "Possible values are 'unknown', 'man', 'woman', 'transgender_man', 'transgender_woman', 'nonbinary', 'option_not_listed', 'prefer_not_to_say', 'two_spirit'",
    type: FieldType.STRING,
  },
  legalGenderMarker: {
    id: 'legalGenderMarker',
    label: 'Legal gender marker',
    description: "Possible values are 'M', 'F', 'X', 'U'",
    type: FieldType.STRING,
  },
  pronouns: {
    id: 'pronouns',
    label: 'Pronouns',
    description:
      "Possible values are 'he_him_his', 'she_her_hers', 'they_them_theirs', 'not_listed'",
    type: FieldType.STRING,
  },
  sexualOrientation: {
    id: 'sexualOrientation',
    label: 'Sexual orientation',
    description:
      "Possible values are 'unknown', 'straight', 'gay', 'bisexual', 'option_not_listed', 'prefer_not_to_say', 'lesbian', 'queer', 'asexual'",
    type: FieldType.STRING,
  },
  ssn: {
    id: 'ssn',
    label: 'SSN',
    description: 'The Social Security number of the patient',
    type: FieldType.STRING,
  },
  ethnicity: {
    id: 'ethnicity',
    label: 'Ethnicity',
    description:
      "Possible values are 'No ethnicity specified', 'Hispanic or Latino', 'Not Hispanic or Latino', 'Declined to specify'.",
    type: FieldType.STRING,
  },
  race: {
    id: 'race',
    label: 'Race',
    description:
      "Possible values are 'No race specified', 'American Indian or Alaska Native', 'Asian', 'Black or African American', 'Native Hawaiian or Other Pacific Islander', 'White', 'Declined to specify'.",
    type: FieldType.STRING,
  },
  preferredLanguage: {
    id: 'preferredLanguage',
    label: 'Preferred language',
    description: "Full names e.g. 'English', 'Spanish' or 'French'.",
    type: FieldType.STRING,
  },
  notes: {
    id: 'notes',
    label: 'Notes',
    description: 'Additional notes about the patient.',
    type: FieldType.STRING,
  },
  previousFirstName: {
    id: 'previousFirstName',
    label: 'Previous first name',
    description: 'The previous first name of the patient',
    type: FieldType.STRING,
  },
  previousLastName: {
    id: 'previousLastName',
    label: 'Previous last name',
    description: 'The previous last name of the patient',
    type: FieldType.STRING,
  },
  status: {
    id: 'status',
    label: 'Status',
    description:
      'The status of the patient (active, deceased, inactive, prospect)',
    type: FieldType.STRING,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description:
      'The tags associated with the patient. Separate multiple tags with a comma (max 10 per patient).',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {} satisfies Record<string, DataPointDefinition>

export const updatePatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updatePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Patient',
  description: "Update a patient profile using Elation's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      patientId,
      firstName,
      lastName,
      actualName,
      caregiverPracticeId,
      genderIdentity,
      legalGenderMarker,
      middleName,
      preferredLanguage,
      previousFirstName,
      previousLastName,
      primaryPhysicianId,
      sexualOrientation,
      status,
      tags,
      ...fields
    } = payload.fields

    const patient = updatePatientSchema.parse({
      ...fields,
      first_name: firstName,
      last_name: lastName,
      primary_physician: primaryPhysicianId,
      caregiver_practice: caregiverPracticeId,
      middle_name: middleName,
      actual_name: actualName,
      gender_identity: genderIdentity,
      legal_gender_marker: legalGenderMarker,
      sexual_orientation: sexualOrientation,
      preferred_language: preferredLanguage,
      previous_first_name: previousFirstName,
      previous_last_name: previousLastName,
      ...(!isNil(status) && {
        patient_status: {
          status,
          ...(status === 'inactive' && { inactive_reason: 'other' }),
        },
      }),
    })

    const id = NumericIdSchema.parse(patientId)

    /** We only want to patch the fields that are not undefined or null so
     *  we know the update is intentional. I.e. if the builder doesn't set
     *  a value for any action field besides the patient ID (which is required)
     *  then we are updating nothing.
     **/
    const updatedPatientFields = Object.entries(patient).reduce(
      (acc: Record<string, unknown>, [key, value]) => {
        if (!isNil(value) && !isEmpty(value)) {
          acc[key] = value
        }
        return acc
      },
      {}
    )

    const api = makeAPIClient(payload.settings)
    if (!isNil(tags)) {
      const formattedTags = tags.split(',').map((tag) => tag.trim())
      // we need to fetch current information because we do not want to override existing tags
      const currentPatientInfo = await api.getPatient(id)

      const currentTags = !isNil(currentPatientInfo.tags)
        ? currentPatientInfo.tags
        : []

      // get a unique list of tags
      updatedPatientFields.tags = union(currentTags, formattedTags)
    }

    await api.updatePatient(id, updatedPatientFields)
    await onComplete()
  },
}
