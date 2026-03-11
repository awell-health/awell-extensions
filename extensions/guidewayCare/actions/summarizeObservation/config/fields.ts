import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  sourceText: {
    id: 'sourceText',
    label: 'Source Text',
    description: 'Full patient call transcript or interaction text',
    type: FieldType.TEXT,
    required: true,
  },
  careFlowId: {
    id: 'careFlowId',
    label: 'Care Flow ID',
    description: 'Identifier for the care flow or pathway',
    type: FieldType.STRING,
    required: false,
  },
  processedDatetime: {
    id: 'processedDatetime',
    label: 'Processed Datetime',
    description: 'ISO 8601 datetime; defaults to current time if omitted',
    type: FieldType.STRING,
    required: false,
  },
  sourceType: {
    id: 'sourceType',
    label: 'Source Type',
    description: 'e.g. phone_call, chat, note',
    type: FieldType.STRING,
    required: false,
  },
  sourceId: {
    id: 'sourceId',
    label: 'Source ID',
    description: 'Unique identifier for the source; auto-generated if omitted',
    type: FieldType.STRING,
    required: false,
  },
  context: {
    id: 'context',
    label: 'Context',
    description: 'Key-value pairs injected as known context into the AI prompt',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  sourceText: z.string().min(1),
  careFlowId: z.string().optional(),
  processedDatetime: z.string().optional(),
  sourceType: z.string().optional(),
  sourceId: z.string().optional(),
  context: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
