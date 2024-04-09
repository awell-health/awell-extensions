import { type Field, FieldType } from '@awell-health/extensions-core'
import { z } from 'zod';

export const fields = {
  healthie_patient_id: {
    id: 'healthie_patient_id',
    label: 'Healthie Patient ID',
    description:
      'The ID of the patient you would like to create a charting note for.',
    type: FieldType.STRING,
    required: true,
  },
  form_id: {
    id: 'form_id',
    label: 'Form ID',
    description:
      'The ID of the form you would like to create the charting note against.',
    type: FieldType.STRING,
    required: true,
  },
  note_content: {
    id: 'note_content',
    label: 'Note content',
    description: 'The json content of the charting note.',
    type: FieldType.JSON,
    required: true,
  },
  marked_locked: {
    id: 'marked_locked',
    label: 'Mark as locked?',
    description: 'This field allows you to mark the content as locked.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  appointment_id: {
    id: 'appointment_id',
    label: 'Appointment ID',
    description:
      'The ID of the appointment you would like the charting note associated with.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

const FormAnswerSchema = z.object({
  custom_module_id: z.string(),
  user_id: z.string(),
  answer: z.string(),
});

const FormAnswersSchema = z.array(FormAnswerSchema);

export const FieldsValidationSchema = z.object({
  healthie_patient_id: z.string(),
  form_id: z.string(),
  note_content: z
    .string()
    .transform((t) => JSON.parse(t))
    .transform((v) => FormAnswersSchema.parse(v)),
  marked_locked: z.boolean().optional(),
  appointment_id: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.healthie_patient_id.match(/^[0-9]*$/) == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `healthie_patient_id ${data.healthie_patient_id} is an invalid number`,
      path: ['healthie_patient_id'],
      fatal: true
    });
  }

  for (const answer of data.note_content) {
    if (answer.user_id !== data.healthie_patient_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `User ID ${answer.user_id} does not match healthie_patient_id ${data.healthie_patient_id}`,
        path: ['note_content'],
        fatal: true
      });
    }
  }
});
