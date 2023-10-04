import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { jsonArraySchema } from '../../../validation'

export const fields = {
  spreadsheetId: {
    id: 'spreadsheetId',
    label: 'Spreadsheet ID',
    description: '####',
    type: FieldType.STRING,
    required: true,
  },
  range: {
    id: 'range',
    label: 'Range',
    description: '####',
    type: FieldType.STRING,
    required: true,
  },
  values: {
    id: 'values',
    label: 'Values',
    description: '####',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  spreadsheetId: z.string().nonempty(),
  range: z.string().nonempty(),
  values: jsonArraySchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
