import {
  type Field,
  FieldType,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { type ZodTypeAny, z } from 'zod'

export const fields = {
  productId: {
    id: 'productId',
    label: 'Product Id',
    description: 'Product id. Guid Ex. 12345678-1234-1234-1234-123456789abc',
    type: FieldType.STRING,
    required: true,
  },
  feedbackEmail: {
    id: 'feedbackEmail',
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

export const FieldsValidationSchema = z.object({
  productId: z.string().min(1),
  feedbackEmail: makeStringOptional(z.string()),
  number:  z.string().min(1),
  content:  z.string().min(1),
 
} satisfies Record<keyof typeof fields, ZodTypeAny>)

