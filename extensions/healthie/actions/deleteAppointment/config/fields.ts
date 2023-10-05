import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description:
      'The id of the appointment in Healthie you would like to delete.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
