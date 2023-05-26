import { z, type ZodTypeAny } from 'zod'
import { type DataPointDefinition } from '@awell-health/awell-extensions-types'

export const dataPoints = {
  generatedNumber: {
    key: 'generatedNumber',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const DataPointsValidationSchema = z.object({
  generatedNumber: z.number().int(),
} satisfies Record<keyof typeof dataPoints, ZodTypeAny>)
