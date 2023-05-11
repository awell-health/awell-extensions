import { FieldType, type Field } from '../../../../lib/types'

export const getAllFields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the Patient that will be linked to the entity in the HIE',
    type: FieldType.STRING,
    required: true,
  },
  facilityId: {
    id: 'facilityId',
    label: 'Facility ID',
    description:
      'The ID of the Facility that is currently providing the Patient care',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const removeFields = {
  ...getAllFields,
  linkSource: {
    id: 'linkSource',
    label: 'Link Source',
    description: 'The HIE to link to - currently COMMONWELL is supported',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const createFields = {
  ...removeFields,
  entityId: {
    id: 'entityId',
    label: 'Entity ID',
    description: 'The ID of the entity in the HIE to link the Patient to',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
