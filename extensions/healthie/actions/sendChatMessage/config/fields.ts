import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  healthie_patient_id: {
    id: 'healthie_patient_id',
    label: 'Healthie Patient ID',
    description:
      'The ID of the patient in Healthie you would like to send a chat message to.',
    type: FieldType.STRING,
    required: true,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description:
      'The ID of the provider, the chat message will be sent in name of this provider.',
    type: FieldType.STRING,
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    description: 'The chat message you would like to send.',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>
