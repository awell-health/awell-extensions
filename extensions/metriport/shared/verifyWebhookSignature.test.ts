import crypto from 'crypto'
import {
  METRIPORT_SIGNATURE_HEADER,
  getSignatureFromHeaders,
  isWebhookRequestAuthorized,
} from './verifyWebhookSignature'

const WEBHOOK_KEY = 'test-webhook-key'
const rawBody = Buffer.from(JSON.stringify({ meta: { type: 'patient.admit' } }))

const sign = (key: string, body: Buffer): string =>
  crypto.createHmac('sha256', key).update(body.toString()).digest('hex')

const validSignature = sign(WEBHOOK_KEY, rawBody)

describe('Metriport - verifyWebhookSignature', () => {
  describe('getSignatureFromHeaders', () => {
    test('Returns the signature when present as a string', () => {
      expect(
        getSignatureFromHeaders({ [METRIPORT_SIGNATURE_HEADER]: 'abc' }),
      ).toBe('abc')
    })

    test('Returns the first value when present as an array', () => {
      expect(
        getSignatureFromHeaders({ [METRIPORT_SIGNATURE_HEADER]: ['abc', 'def'] }),
      ).toBe('abc')
    })

    test('Returns undefined when absent', () => {
      expect(getSignatureFromHeaders({})).toBeUndefined()
    })
  })

  describe('isWebhookRequestAuthorized', () => {
    describe('when no webhook key is configured', () => {
      test('Authorizes regardless of headers (verification disabled)', () => {
        expect(
          isWebhookRequestAuthorized({
            webhookKey: undefined,
            rawBody,
            headers: {},
          }),
        ).toBe(true)
      })

      test('Treats an empty-string key as not configured', () => {
        expect(
          isWebhookRequestAuthorized({ webhookKey: '', rawBody, headers: {} }),
        ).toBe(true)
      })
    })

    describe('when a webhook key is configured', () => {
      test('Authorizes a valid HMAC-SHA256 signature over the raw body', () => {
        expect(
          isWebhookRequestAuthorized({
            webhookKey: WEBHOOK_KEY,
            rawBody,
            headers: { [METRIPORT_SIGNATURE_HEADER]: validSignature },
          }),
        ).toBe(true)
      })

      test('Authorizes when the signature is delivered as a header array', () => {
        expect(
          isWebhookRequestAuthorized({
            webhookKey: WEBHOOK_KEY,
            rawBody,
            headers: { [METRIPORT_SIGNATURE_HEADER]: [validSignature] },
          }),
        ).toBe(true)
      })

      test('Rejects when the signature header is missing', () => {
        expect(
          isWebhookRequestAuthorized({
            webhookKey: WEBHOOK_KEY,
            rawBody,
            headers: {},
          }),
        ).toBe(false)
      })

      test('Rejects a signature computed with the wrong key', () => {
        expect(
          isWebhookRequestAuthorized({
            webhookKey: WEBHOOK_KEY,
            rawBody,
            headers: { [METRIPORT_SIGNATURE_HEADER]: sign('wrong-key', rawBody) },
          }),
        ).toBe(false)
      })

      test('Rejects a valid signature computed over a different body', () => {
        expect(
          isWebhookRequestAuthorized({
            webhookKey: WEBHOOK_KEY,
            rawBody,
            headers: {
              [METRIPORT_SIGNATURE_HEADER]: sign(
                WEBHOOK_KEY,
                Buffer.from('tampered'),
              ),
            },
          }),
        ).toBe(false)
      })
    })
  })
})
