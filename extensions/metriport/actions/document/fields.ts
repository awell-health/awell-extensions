import { FieldType, type Field } from '../../../../lib/types'

export const listFields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the Patient for which to list their available Documents',
    type: FieldType.STRING,
    required: true,
  },
  facilityId: {
    id: 'facilityId',
    label: 'Facility ID',
    description: 'The ID of the Facility where the patient is receiving care',
    type: FieldType.STRING,
    required: true,
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
