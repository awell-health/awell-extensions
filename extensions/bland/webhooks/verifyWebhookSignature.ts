import { createHmac, timingSafeEqual } from 'crypto'
import { type IncomingHttpHeaders } from 'http'
import { isNil } from 'lodash'

/**
 * The header Bland delivers the webhook signature in.
 * https://docs.bland.ai/tutorials/webhook-signing
 */
export const BLAND_SIGNATURE_HEADER = 'x-webhook-signature'

const hmacHex = (secret: string, data: Buffer | string): string =>
  createHmac('sha256', secret).update(data).digest('hex')

/** Constant-time comparison; `timingSafeEqual` throws on different lengths. */
const sameHex = (expected: string, received: string): boolean => {
  const a = Buffer.from(expected.toLowerCase())
  const b = Buffer.from(received.trim().toLowerCase())
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Verifies a Bland webhook request.
 *
 * Bland signs each webhook with an HMAC-SHA256 of the body using the account's
 * webhook secret, hex-encoded in `X-Webhook-Signature`. Bland's own example
 * verifies against `JSON.stringify(req.body)`, the re-serialized body, so a
 * signature over either the raw bytes or that re-serialization is accepted:
 * both need the secret to produce. The docs describe no timestamp, so a
 * captured request can be replayed; the signature proves who sent it, not when.
 * https://docs.bland.ai/tutorials/webhook-signing
 *
 * @returns `true` if the request is authorized: either no signing secret is
 * configured (verification disabled) or the signature is present and valid.
 */
export const isWebhookRequestAuthorized = ({
  signingSecret,
  rawBody,
  payload,
  headers,
}: {
  signingSecret: string | undefined
  rawBody: Buffer
  payload: unknown
  headers: IncomingHttpHeaders
}): boolean => {
  const secret = signingSecret?.trim()
  // When no signing secret is configured, signature verification is disabled.
  if (isNil(secret) || secret.length === 0) {
    return true
  }

  const header = headers[BLAND_SIGNATURE_HEADER]
  const signature = Array.isArray(header) ? header[0] : header
  if (isNil(signature) || signature.length === 0) {
    return false
  }

  if (sameHex(hmacHex(secret, rawBody), signature)) {
    return true
  }
  return (
    payload !== undefined &&
    sameHex(hmacHex(secret, JSON.stringify(payload)), signature)
  )
}
