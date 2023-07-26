import { reduce, toPairs } from 'lodash'

export const replaceStringVariables = (
  source: string,
  obj: Record<string, string | number | boolean>
): string => {
  const keyPairs = toPairs(obj)

  return reduce(
    keyPairs,
    (result, [key, value]): string => result.replace(`{${key}}`, String(value)),
    source
  )
}
