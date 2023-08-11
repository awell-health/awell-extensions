import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description: "The user's unique ID in Sendbird.",
  },
  leaveAllGroupChannelsUponDeactivation: {
    label: 'Leave all group channels upon deactivation',
    id: 'leaveAllGroupChannelsUponDeactivation',
    type: FieldType.BOOLEAN,
    required: false,
    description:
      'Determines whether the user leaves all joined group channels upon deactivation. Defaults to true if not specified.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  leaveAllGroupChannelsUponDeactivation: z.boolean().optional().default(true),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
