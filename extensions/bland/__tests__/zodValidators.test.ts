import { SendCallResponseSchema } from '../api/schema/SendCall.schema'

describe('bland SendCallResponseSchema call_id (zod 4 z.guid())', () => {
  const base = { status: 'success', message: 'Call successfully queued.' }

  it.each([
    ['an RFC 4122 v4 UUID', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'],
    // `z.guid()` (unlike `z.uuid()`) does not enforce the RFC version/variant
    // nibbles, so Bland ids that are not strict UUIDs still pass.
    ['a non-RFC-nibble GUID', '12345678-1234-1234-1234-123456789012'],
  ])('accepts %s', (_, call_id) => {
    expect(SendCallResponseSchema.safeParse({ ...base, call_id }).success).toBe(
      true,
    )
  })

  it.each(['not-a-guid', '', '12345678-1234-1234-1234-12345678901'])(
    'rejects %j',
    (call_id) => {
      const result = SendCallResponseSchema.safeParse({ ...base, call_id })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['call_id'])
    },
  )
})
