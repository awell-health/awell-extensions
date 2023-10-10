import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'Task ID',
    description: 'The id of the task in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
