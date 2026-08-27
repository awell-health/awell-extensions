/**
 * Shared accept/reject tables for the zod 4 string-format validators
 * (`z.url()`, `z.email()`, `z.iso.datetime()`, `z.guid()`) that replaced the
 * zod 3 `z.string().url()` style chains during the migration.
 */
export const VALID_URLS = [
  'https://api.example.com',
  'https://x.example.com:8443/path?q=1',
  'http://localhost:3000',
]
export const INVALID_URLS = ['example.com', 'not a url']

export const VALID_EMAILS = ['user+tag@sub.example.co.uk', 'UPPER@EXAMPLE.COM']
export const INVALID_EMAILS = [
  'user@',
  '@example.com',
  'user@example',
  'user example@x.com',
]

export const VALID_ISO_DATETIMES = [
  '2024-01-02T10:00:00Z',
  '2024-01-02T10:00:00.123Z',
]
// zod's `z.iso.datetime()` defaults to `offset: false`, so a numeric offset
// is rejected; only `Z` is accepted.
export const INVALID_ISO_DATETIMES = [
  '2024-01-02',
  '2024-01-02T10:00:00+02:00',
  'garbage',
]
