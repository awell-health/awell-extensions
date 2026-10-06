import { createHmac } from 'crypto'
import {
  BLAND_SIGNATURE_HEADER,
  isWebhookRequestAuthorized,
} from './verifyWebhookSignature'

const SECRET = 'whsec_test_secret'
const payload = { call_id: 'call-1', status: 'completed', variables: { a: 1 } }
const rawBody = Buffer.from(JSON.stringify(payload))

const sign = (data: Buffer | string, secret = SECRET): string =>
  createHmac('sha256', secret).update(data).digest('hex')

const check = (
  overrides: Partial<Parameters<typeof isWebhookRequestAuthorized>[0]> = {},
): boolean =>
  isWebhookRequestAuthorized({
    signingSecret: SECRET,
    rawBody,
    payload,
    headers: { [BLAND_SIGNATURE_HEADER]: sign(rawBody) },
    ...overrides,
  })

describe('Bland - isWebhookRequestAuthorized', () => {
  describe('When no signing secret is configured', () => {
    test.each([undefined, '', '   '])(
      'Should authorize without looking at the signature (secret: %p)',
      (signingSecret) => {
        expect(check({ signingSecret, headers: {} })).toBe(true)
        expect(
          check({ signingSecret, headers: { [BLAND_SIGNATURE_HEADER]: 'junk' } }),
        ).toBe(true)
      },
    )
  })

  describe('When a signing secret is configured', () => {
    test('Should use the header Bland documents', () => {
      expect(BLAND_SIGNATURE_HEADER).toBe('x-webhook-signature')
    })

    test('Should authorize an HMAC-SHA256 hex signature of the raw body', () => {
      expect(check()).toBe(true)
    })

    // RFC 4231, test case 2: a signature computed outside this code, so a
    // mistake the tests share with the implementation cannot pass.
    test('Should agree with the standard HMAC-SHA256 test vector', () => {
      expect(
        isWebhookRequestAuthorized({
          signingSecret: 'Jefe',
          rawBody: Buffer.from('what do ya want for nothing?'),
          payload: undefined,
          headers: {
            [BLAND_SIGNATURE_HEADER]:
              '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
          },
        }),
      ).toBe(true)
    })

    test('Should ignore the case of the hex digits', () => {
      expect(
        check({ headers: { [BLAND_SIGNATURE_HEADER]: sign(rawBody).toUpperCase() } }),
      ).toBe(true)
    })

    test('Should read the first value when the header arrives as a list', () => {
      expect(
        check({ headers: { [BLAND_SIGNATURE_HEADER]: [sign(rawBody), 'other'] } }),
      ).toBe(true)
    })

    test('Should ignore whitespace around the secret as it was pasted', () => {
      expect(check({ signingSecret: `  ${SECRET}\n` })).toBe(true)
    })

    // Bland's documented example verifies against JSON.stringify(req.body), the
    // re-serialized body, so a signature over that is accepted too.
    test('Should authorize a signature over the re-serialized payload when the raw bytes differ', () => {
      const pretty = Buffer.from(JSON.stringify(payload, null, 2))

      expect(
        check({
          rawBody: pretty,
          headers: { [BLAND_SIGNATURE_HEADER]: sign(JSON.stringify(payload)) },
        }),
      ).toBe(true)
    })

    test('Should refuse a request with no signature', () => {
      expect(check({ headers: {} })).toBe(false)
      expect(check({ headers: { [BLAND_SIGNATURE_HEADER]: '' } })).toBe(false)
    })

    test('Should refuse a signature made with another secret', () => {
      expect(
        check({ headers: { [BLAND_SIGNATURE_HEADER]: sign(rawBody, 'other') } }),
      ).toBe(false)
    })

    test('Should refuse a body that was changed after it was signed', () => {
      const tampered = Buffer.from(JSON.stringify({ ...payload, status: 'failed' }))

      expect(check({ rawBody: tampered, payload: { ...payload, status: 'failed' } })).toBe(
        false,
      )
    })

    test.each(['junk', 'a', sign(rawBody).slice(0, -2), `${sign(rawBody)}00`])(
      'Should refuse a signature of the wrong shape or length (%p)',
      (signature) => {
        expect(check({ headers: { [BLAND_SIGNATURE_HEADER]: signature } })).toBe(false)
      },
    )

    test('Should not throw when there is no payload to re-serialize', () => {
      expect(
        check({
          payload: undefined,
          headers: { [BLAND_SIGNATURE_HEADER]: 'junk' },
        }),
      ).toBe(false)
    })
  })
})
