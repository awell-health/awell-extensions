import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
  validateCommaSeparatedList,
} from '@awell-health/extensions-core'
import { CustomFieldsValidationSchema } from '../../../validation'
import { TicketPriority } from '../../../types'

export const fields = {
  customerId: {
    label: 'Customer ID',
    id: 'customerId',
    type: FieldType.NUMERIC,
    required: true,
    description: "A customer's unique ID.",
  },
  channelName: {
    label: 'Channel name',
    id: 'channelName',
    type: FieldType.STRING,
    required: true,
    description:
      'Specifies the title of a ticket, which will be the group channel name in Sendbird Chat platform as well. Maximum length is 100 characters.',
  },
  relatedChannelUrls: {
    label: 'Related channel URLs',
    id: 'relatedChannelUrls',
    type: FieldType.STRING,
    required: false,
    description:
      'A comma-separated string of group channel URLs for reference, where the corresponding customer belongs. Can have up to 3 group channel URLs.',
  },
  groupKey: {
    label: 'Group key',
    id: 'groupKey',
    type: FieldType.STRING,
    required: false,
    description:
      'Specifies the unique key of a group for ticket assignment. The key can be a mix of lowercase letters, hyphens, underscores, or numbers.',
  },
  priority: {
    label: 'Priority',
    id: 'priority',
    type: FieldType.STRING,
    required: false,
    description:
      'Specifies the priority of a ticket. Acceptable values are the following: "LOW", "MEDIUM", "HIGH", and "URGENT". Defaults to: "MEDIUM".',
  },
  customFields: {
    id: 'customFields',
    label: 'Custom fields',
    description:
      'A JSON object that can store up to twenty key-value items for additional customer information. The specified keys must be registered as a custom field in Sendbird.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

const priorityEnum = z.enum<
  TicketPriority,
  [TicketPriority, ...TicketPriority[]]
>(Object.values(TicketPriority) as [TicketPriority, ...TicketPriority[]])

export const FieldsValidationSchema = z.object({
  customerId: z.coerce.number(),
  channelName: z.string().max(100).nonempty(),
  relatedChannelUrls: makeStringOptional(
    validateCommaSeparatedList(
      (value) => z.string().safeParse(value).success,
      false
    )
  ),
  groupKey: makeStringOptional(z.string().regex(/^[a-z0-9\-_]*$/)),
  priority: makeStringOptional(priorityEnum),
  customFields: makeStringOptional(CustomFieldsValidationSchema),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
