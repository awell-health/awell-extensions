import { FieldType, type Field } from '../../../../lib/types'
import { address } from '../../shared/fields'

export const orgFields = {
  name: {
    id: 'name',
    label: 'Name',
    description: 'The name of your organization',
    type: FieldType.STRING,
    required: true,
  },
  type: {
    id: 'type',
    label: 'Type',
    description:
      'The type of your organization, can be one of: acuteCare, ambulatory, hospital, labSystems, pharmacy, postAcuteCare',
    type: FieldType.STRING,
    required: true,
  },
  ...address,
} satisfies Record<string, Field>

export const orgWithIdFields = {
  id: {
    id: 'id',
    label: 'Organization ID',
    description: 'The ID of the organization to update',
    type: FieldType.STRING,
    required: true,
  },
  ...orgFields,
} satisfies Record<string, Field>

export const getFields = {} satisfies Record<string, Field>
