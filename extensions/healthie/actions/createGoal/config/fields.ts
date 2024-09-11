import { FieldType, type Field } from '@awell-health/extensions-core'
import { format, isAfter } from 'date-fns'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  healthiePatientId: {
    id: 'healthiePatientId',
    label: 'Healthie patient ID',
    description: 'The ID of the patient in Healthie',
    type: FieldType.STRING,
    required: true,
  },
  name: {
    id: 'name',
    label: 'Name',
    description: 'The name of the goal',
    type: FieldType.STRING,
    required: true,
  },
  titleLink: {
    id: 'titleLink',
    label: 'Title link',
    description: 'The link to add behind the goal',
    type: FieldType.TEXT,
    required: false,
  },
  repeat: {
    id: 'repeat',
    label: 'Repeat',
    description: `The frequency of this goal. Possible values are: Daily, Weekly, Once. Defaults to "Once"`,
    type: FieldType.STRING,
    required: false,
  },
  dueDate: {
    id: 'dueDate',
    label: 'Due date',
    description: 'The date the goal should end and dissapear from the portal',
    type: FieldType.DATE,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  healthiePatientId: z.string().min(1),
  name: z.string().min(1),
  titleLink: z.string().optional(),
  repeat: z
    .union([z.enum(['Daily', 'Weekly', 'Once']), z.literal('')])
    .optional()
    .default('Once')
    .transform((val) => (val === '' ? 'Once' : val)),
  dueDate: z
    .union([z.coerce.date(), z.literal('')])
    .optional()
    .transform((date) =>
      date !== undefined && date !== '' ? format(date, 'yyyy-MM-dd') : undefined
    )
    .refine(
      (dueDateString) => {
        if (dueDateString === undefined) return true
        const today = new Date()
        const dueDate = new Date(dueDateString)
        return isAfter(dueDate, today)
      },
      {
        message: 'Due date must be at least 1 day in the future.',
      }
    ),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
