import { FieldType, type Field } from '../../../../lib/types'
import { address } from '../../shared/fields'

export const facilityFields = {
  name: {
    id: 'name',
    label: 'Name',
    description: 'The name of your organization',
    type: FieldType.STRING,
    required: true,
  },
  npi: {
    id: 'npi',
    label: 'National Provider Identifier (NPI)',
    description:
      'The 10 digit National Provider Identifier (NPI) that will be used to make requests on behalf of the Facility',
    type: FieldType.NUMERIC,
    required: true,
  },
  tin: {
    id: 'tin',
    label: 'Tax Identification Number (TIN)',
    description:
      'The 10 digit National Provider Identifier (NPI) that will be used to make requests on behalf of the Facility',
    type: FieldType.NUMERIC,
    required: true,
  },
  active: {
    id: 'active',
    label: 'Active',
    description:
      'Whether or not this Facility is currently active - this is usually true.',
    type: FieldType.BOOLEAN,
  },
  ...address,
} satisfies Record<string, Field>

export const facilityWithIdFields = {
  id: {
    id: 'id',
    label: 'Facility ID',
    description: 'The ID of the facility to update',
    type: FieldType.STRING,
    required: true,
  },
  ...facilityFields,
} satisfies Record<string, Field>

export const getFields = {
  facilityId: {
    id: 'facilityId',
    label: 'Facility ID',
    description: 'The facility ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
