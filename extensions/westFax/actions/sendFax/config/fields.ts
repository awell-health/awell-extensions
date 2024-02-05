import {
  type Field,
  FieldType,
} from '@awell-health/extensions-core'

export const fields = {
  product_id: {
    id: 'product_id',
    label: 'Product Id',
    description: 'Product id. Guid Ex. 12345678-1234-1234-1234-123456789abc',
    type: FieldType.STRING,
    required: true,
  },
  feedback_email: {
    id: 'feedback_email',
    label: 'Feedback Email',
    description: 'The email that the fax is sent to',
    type: FieldType.STRING,
    required: false,
  },
  number: {
    id: 'number',
    label: 'Number',
    description: 'Destination Fax Number',
    type: FieldType.STRING,
    required: true,
  },
  content: {
    id: 'content',
    label: 'Fax content',
    description: 'Content of the fax',
    type: FieldType.HTML,
    required: false,
  },
} satisfies Record<string, Field>
