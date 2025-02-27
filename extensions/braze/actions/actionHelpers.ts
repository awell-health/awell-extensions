export const addBooleanFieldIfDefined = <
  T extends Record<string, boolean | undefined>,
>(
  obj: T,
): Record<string, boolean> | Record<string, unknown> => {
  const [[key, value]] = Object.entries(obj)
  return typeof value === 'boolean' ? { [key]: value } : {}
}
