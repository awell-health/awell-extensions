import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  userId: {
    id: 'userId',
    label: 'User ID',
    description: 'The ID of the patient that this entry should be attached to',
    type: FieldType.STRING,
    required: true,
  },
  category: {
    id: 'category',
    label: 'Category',
    description: 'Specifies what kind of metric we are storing',
    type: FieldType.STRING,
    required: true,
  },
  metricStat: {
    id: 'metricStat',
    label: 'Metric stat',
    description: 'The actual data value for the metric',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
