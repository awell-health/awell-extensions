import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

// {
//   "name": "Complete Awell form 3",
//   "user_id": "1587874",
//   "title_link": "https://goto.sandbox.awell.health/c/yourpatientchoice",
//   "repeat": "Once"
// }

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
    description: `The frequency of this goal. Possible values are: 'Daily','Weekly', 'Once'`,
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  healthiePatientId: z.string().min(1),
  name: z.string().min(1),
  titleLink: z.string().optional(),
  repeat: z.enum(['Daily', 'Weekly', 'Once']),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
