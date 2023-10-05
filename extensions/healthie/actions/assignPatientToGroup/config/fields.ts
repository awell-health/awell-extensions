import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'Patient ID',
    description: 'The id of the patient in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  groupId: {
    id: 'groupId',
    label: 'Group ID',
    description:
      'The ID of the group the patient will be assigned to. Leave blank to remove the patient from a group.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>
