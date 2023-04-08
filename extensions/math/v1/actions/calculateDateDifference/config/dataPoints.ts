import { z, type ZodTypeAny } from 'zod'
import { type DataPointDefinition } from '../../../../../../lib/types'

export const dataPoints = {
  dateDifference: {
    key: 'dateDifference',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const DataPointsValidationSchema = z.object({
  dateDifference: z.number(),
} satisfies Record<keyof typeof dataPoints, ZodTypeAny>)

export const validateDataPoints = (
  dp: unknown
): z.infer<typeof DataPointsValidationSchema> => {
  const parsedData = DataPointsValidationSchema.parse(dp)

  return parsedData
}
