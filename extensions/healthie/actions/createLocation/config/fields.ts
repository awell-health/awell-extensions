import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the patient in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  name: {
    id: 'name',
    label: 'Name',
    description: 'The name of the address.',
    type: FieldType.STRING,
  },
  country: {
    id: 'country',
    label: 'Country',
    description: 'The country of the patient.',
    type: FieldType.STRING,
  },
  state: {
    id: 'state',
    label: 'State',
    description: "The state patient's lives in.",
    type: FieldType.STRING,
  },
  city: {
    id: 'city',
    label: 'City',
    description: 'The city of the patient.',
    type: FieldType.STRING,
  },
  zip: {
    id: 'zip',
    label: 'Zip code',
    description: 'The zip code of the patient.',
    type: FieldType.STRING,
  },
  line1: {
    id: 'line1',
    label: 'Line 1',
    description: 'The line 1 of the address.',
    type: FieldType.STRING,
    required: true,
  },
  line2: {
    id: 'line2',
    label: 'Line 2',
    description: 'The line 2 of the address.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>
