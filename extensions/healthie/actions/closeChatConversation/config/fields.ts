import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the conversation in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description: 'The ID of the provider that closes the conversation.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
