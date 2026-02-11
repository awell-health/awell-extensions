import { FieldType, type Field } from '@awell-health/extensions-core'

export const listFields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the Patient for which to list their available Documents',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const queryFields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the Patient for which to query Documents across HIEs',
    type: FieldType.STRING,
    required: true,
  },
  facilityId: {
    id: 'facilityId',
    label: 'Facility ID',
    description:
      'The facility providing the NPI to support this operation. Optional if the patient has only one facility.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const getUrlFields = {
  fileName: {
    id: 'fileName',
    label: 'File Name',
    description: 'The file name of the document',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
