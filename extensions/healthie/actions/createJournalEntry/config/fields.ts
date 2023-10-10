import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the patient in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  type: {
    id: 'type',
    label: 'Type',
    description:
      'The type of entry. Valid options are: ["MetricEntry", "FoodEntry", "WorkoutEntry", "MirrorEntry", "SleepEntry", "NoteEntry", "WaterIntakeEntry", "PoopEntry", "SymptomEntry"].',
    type: FieldType.STRING,
    required: true,
  },
  percieved_hungriness: {
    id: 'percieved_hungriness',
    label: 'Perceived hungriness',
    description:
      'A string index of hungriness. Valid options are: ["1", "2", "3"].',
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>
