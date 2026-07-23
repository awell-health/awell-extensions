import { isNil } from 'lodash'
import { type IncomingHttpHeaders } from 'http'
import { MetriportMedicalApi } from '@metriport/api-sdk'

/**
 * The header Metriport uses to deliver the webhook signature.
 * https://docs.metriport.com/medical-api/getting-started/webhooks#authentication
 */
export const METRIPORT_SIGNATURE_HEADER = 'x-metriport-signature'

/**
 * Extracts the signature from the request headers, normalising the
 * `string | string[] | undefined` type that `IncomingHttpHeaders` allows.
 */
export const getSignatureFromHeaders = (
  headers: IncomingHttpHeaders,
): string | undefined => {
  const header = headers[METRIPORT_SIGNATURE_HEADER]
  return Array.isArray(header) ? header[0] : header
}

/**
 * Verifies a Metriport webhook request.
 *
 * Metriport signs each request with an HMAC-SHA256 of the raw request body
 * using the webhook key, delivered in the `x-metriport-signature` header. The
 * hash must be computed over the raw body (never the re-serialized payload),
 * which is why this takes the `rawBody` buffer.
 * https://docs.metriport.com/medical-api/getting-started/webhooks#authentication
 *
 * @returns `true` if the request is authorized: either no webhook key is
 * configured (verification disabled) or the signature is present and valid.
 * `false` when a key is configured but the signature is missing or invalid.
 */
export const isWebhookRequestAuthorized = ({
  webhookKey,
  rawBody,
  headers,
}: {
  webhookKey: string | undefined
  rawBody: Buffer
  headers: IncomingHttpHeaders
}): boolean => {
  // When no webhook key is configured, signature verification is disabled.
  if (isNil(webhookKey) || webhookKey.length === 0) {
    return true
  }

  const signature = getSignatureFromHeaders(headers)
  if (isNil(signature) || signature.length === 0) {
    return false
  }

  return MetriportMedicalApi.verifyWebhookSignature(
    webhookKey,
    rawBody,
    signature,
  )
}
