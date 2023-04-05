import { type z, type ZodTypeAny } from 'zod'

export function validate<T extends ZodTypeAny>({
  schema,
  payload,
}: {
  schema: T
  payload: unknown
}): z.infer<T> {
  const parsedData = schema.parse(payload)
  return parsedData
}
