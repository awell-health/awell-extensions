import { FieldType, type Field } from '../../../lib/types'

export const address = {
  addressLine1: {
    id: 'addressLine1',
    label: 'Address Line 1',
    description: 'The address',
    type: FieldType.STRING,
    required: true,
  },
  addressLine2: {
    id: 'addressLine2',
    label: 'Address Line 2',
    description: 'The address details',
    type: FieldType.STRING,
  },
  city: {
    id: 'city',
    label: 'City',
    description: 'The city',
    type: FieldType.STRING,
    required: true,
  },
  state: {
    id: 'state',
    label: 'State',
    description: 'The 2 letter state acronym, for example: CA',
    type: FieldType.STRING,
    required: true,
  },
  zip: {
    id: 'zip',
    label: 'Zip',
    description: '5 digit zip code',
    type: FieldType.STRING,
    required: true,
  },
  country: {
    id: 'country',
    label: 'Country',
    description: 'Must be “USA”',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
