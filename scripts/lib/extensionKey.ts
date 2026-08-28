/**
 * An extension key names a directory under `extensions/` and is spliced into
 * generated import paths, so it must be a plain identifier: a letter followed
 * by letters, digits, `_` or `-`. Every existing extension directory matches
 * (camelCase like `canvasMedical`, hyphenated like `external-server`).
 *
 * Validating here — before the key reaches `path.join` — is what stops a key
 * like `../../etc` from writing scaffolding outside the repo.
 */
export const EXTENSION_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/

export const isValidExtensionKey = (key: string): boolean =>
  EXTENSION_KEY_PATTERN.test(key)

export const assertValidExtensionKey = (key: string): string => {
  if (!isValidExtensionKey(key)) {
    throw new Error(
      `Invalid extension key "${key}": must start with a letter and contain only letters, digits, "_" or "-" (e.g. "acmeHealth")`,
    )
  }
  return key
}
