import { z, type ZodTypeAny } from 'zod'
import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  generatedNumber: {
    key: 'generatedNumber',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const DataPointsValidationSchema = z.object({
  generatedNumber: z.number().int(),
} satisfies Record<keyof typeof dataPoints, ZodTypeAny>)
