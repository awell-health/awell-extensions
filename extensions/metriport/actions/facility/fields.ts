import { FieldType, type Field } from '@awell-health/extensions-core'

export const getByNameFields = {
  facilityName: {
    id: 'facilityName',
    label: 'Facility Name',
    description:
      'The name of the Facility to look up. Matched case-insensitively, ignoring surrounding whitespace, and must match exactly one Facility in your Organization.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
